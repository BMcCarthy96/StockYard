"""
The only module that talks to yfinance. Everything else (markets table,
ticker tape, watchlist, portfolio pricing, asset detail charts) goes through
get_quotes()/get_history() so there's a single TTL-cached batch fetch backing
the whole app, and a single deterministic simulated fallback so the demo
never breaks if Yahoo rate-limits or is unreachable.
"""
import math
import random
import threading
import time
from datetime import datetime, timedelta, timezone

import yfinance as yf

from app.assets import get_asset, all_symbols

QUOTES_TTL = 60
HISTORY_TTL = {
    "1D": 120,
    "1W": 300,
    "1M": 3600,
    "3M": 3600,
    "1Y": 3600,
    "ALL": 86400,
}
HISTORY_PARAMS = {
    "1D": {"period": "1d", "interval": "5m"},
    "1W": {"period": "7d", "interval": "60m"},
    "1M": {"period": "1mo", "interval": "1d"},
    "3M": {"period": "3mo", "interval": "1d"},
    "1Y": {"period": "1y", "interval": "1d"},
    "ALL": {"period": "max", "interval": "1wk"},
}
HISTORY_INTERVAL_LABEL = {k: v["interval"] for k, v in HISTORY_PARAMS.items()}
SIM_EPOCH = datetime(2020, 1, 1, tzinfo=timezone.utc).date()


class _TTLCache:
    """Single global lock is fine here: request volume for a demo app is low
    and this guarantees only one thread ever calls a given producer, which
    prevents a cache-stampede of duplicate yfinance calls for the same key."""

    def __init__(self):
        self._lock = threading.Lock()
        self._store = {}

    def get_or_set(self, key, ttl, producer):
        now = time.time()
        with self._lock:
            entry = self._store.get(key)
            if entry is not None and entry[0] > now:
                return entry[1]
            value = producer()
            self._store[key] = (now + ttl, value)
            return value


_cache = _TTLCache()


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------- quotes ---

def get_quotes(symbols=None):
    full = _cache.get_or_set(("quotes", "all"), QUOTES_TTL, lambda: _fetch_quotes(all_symbols()))
    if symbols is None:
        return full
    wanted = [s for s in symbols if s in full["quotes"]]
    return {"quotes": {s: full["quotes"][s] for s in wanted}, "asOf": full["asOf"]}


def _fetch_quotes(symbols):
    try:
        live_data = yf.download(
            tickers=symbols, period="5d", interval="1d",
            group_by="ticker", threads=True, progress=False,
        )
    except Exception:
        live_data = None

    quotes = {}
    for symbol in symbols:
        quote = _quote_from_batch(live_data, symbol) if live_data is not None else None
        quotes[symbol] = quote if quote is not None else _simulated_quote(symbol)
    return {"quotes": quotes, "asOf": _now_iso()}


def _quote_from_batch(live_data, symbol):
    try:
        df = live_data[symbol].dropna(how="all")
        if df.empty:
            return None
        last = df.iloc[-1]
        prev = df.iloc[-2] if len(df) >= 2 else last
        price = float(last["Close"])
        prev_close = float(prev["Close"])
        if math.isnan(price) or math.isnan(prev_close):
            return None
        return _build_quote(price, prev_close, float(last["High"]), float(last["Low"]), last["Volume"], "live")
    except Exception:
        return None


def _simulated_quote(symbol):
    asset = get_asset(symbol)
    if asset is None:
        return None
    today = datetime.now(timezone.utc).date()
    series = _simulate_daily_series(symbol, asset, today)
    last = series[-1]
    prev_close = series[-2]["c"] if len(series) >= 2 else last["o"]
    return _build_quote(last["c"], prev_close, last["h"], last["l"], last["v"], "simulated")


def _build_quote(price, prev_close, day_high, day_low, volume, source):
    change = price - prev_close
    change_percent = (change / prev_close * 100) if prev_close else 0.0
    volume = 0 if volume is None or (isinstance(volume, float) and math.isnan(volume)) else int(volume)
    return {
        "price": round(price, 8),
        "prevClose": round(prev_close, 8),
        "change": round(change, 8),
        "changePercent": round(change_percent, 4),
        "dayHigh": round(day_high, 8),
        "dayLow": round(day_low, 8),
        "volume": volume,
        "source": source,
    }


# --------------------------------------------------------------- history ---

def get_history(symbol, range_key):
    asset = get_asset(symbol)
    if asset is None:
        return None
    range_key = range_key.upper() if range_key else "1M"
    if range_key not in HISTORY_PARAMS:
        range_key = "1M"
    ttl = HISTORY_TTL[range_key]
    return _cache.get_or_set(
        ("history", symbol, range_key), ttl,
        lambda: _fetch_history(symbol, asset, range_key),
    )


def _fetch_history(symbol, asset, range_key):
    params = HISTORY_PARAMS[range_key]
    try:
        df = yf.Ticker(symbol).history(period=params["period"], interval=params["interval"])
        candles = _candles_from_df(df)
        if range_key == "1D" and not candles:
            df = yf.Ticker(symbol).history(period="5d", interval="5m")
            candles = _slice_last_session(_candles_from_df(df))
        if candles:
            return {
                "symbol": symbol,
                "range": range_key,
                "interval": params["interval"],
                "source": "live",
                "candles": candles,
            }
    except Exception:
        pass
    return _simulated_history(symbol, asset, range_key)


def _candles_from_df(df):
    if df is None or df.empty:
        return []
    candles = []
    for ts, row in df.iterrows():
        if any(math.isnan(row[c]) for c in ("Open", "High", "Low", "Close")):
            continue
        volume = row.get("Volume", 0)
        volume = 0 if volume is None or (isinstance(volume, float) and math.isnan(volume)) else int(volume)
        candles.append({
            "t": int(ts.timestamp()),
            "o": round(float(row["Open"]), 8),
            "h": round(float(row["High"]), 8),
            "l": round(float(row["Low"]), 8),
            "c": round(float(row["Close"]), 8),
            "v": volume,
        })
    return candles


def _slice_last_session(candles):
    if not candles:
        return []
    last_date = datetime.fromtimestamp(candles[-1]["t"], tz=timezone.utc).date()
    return [c for c in candles if datetime.fromtimestamp(c["t"], tz=timezone.utc).date() == last_date]


# ------------------------------------------------- deterministic fallback --

def _is_trading_day(asset_type, d):
    return True if asset_type == "crypto" else d.weekday() < 5


def _base_volume(asset):
    return 50_000_000 if asset["type"] == "crypto" else 5_000_000


def _simulate_daily_series(symbol, asset, end_date):
    """Deterministic geometric random walk seeded by symbol, daily from a
    fixed epoch through end_date. Same (symbol, end_date) always reproduces
    the same series, so "today's" price only changes once per real day."""
    rng = random.Random(symbol)
    sigma = asset["volatility"]
    drift = -0.5 * sigma * sigma
    price = asset["base_price"]
    series = []
    d = SIM_EPOCH
    while d <= end_date:
        if _is_trading_day(asset["type"], d):
            open_price = price
            close_price = max(open_price * math.exp(rng.gauss(drift, sigma)), 0.0001)
            wick = abs(rng.gauss(0, sigma * 0.4))
            high = max(open_price, close_price) * (1 + wick)
            low = min(open_price, close_price) * (1 - wick)
            volume = int(_base_volume(asset) * rng.uniform(0.5, 1.6))
            series.append({"date": d, "o": open_price, "h": high, "l": low, "c": close_price, "v": volume})
            price = close_price
        d += timedelta(days=1)
    return series


def _session_window(asset_type, day):
    start_of_day = datetime.combine(day, datetime.min.time(), tzinfo=timezone.utc)
    if asset_type == "crypto":
        return start_of_day, start_of_day + timedelta(days=1)
    # Approximate a 9:30-16:00 US-Eastern session in UTC (cosmetic only).
    start = start_of_day + timedelta(hours=13, minutes=30)
    return start, start + timedelta(hours=6, minutes=30)


def _simulate_session_candles(symbol, asset, day, day_open, day_close, num_points):
    rng = random.Random(f"{symbol}:{day.isoformat()}")
    sigma = asset["volatility"]
    sigma_step = sigma / math.sqrt(num_points) * 1.5

    walk = [0.0]
    for _ in range(num_points):
        walk.append(walk[-1] + rng.gauss(0, sigma_step))
    total_drift = walk[-1]

    log_open, log_close = math.log(day_open), math.log(day_close)
    prices = []
    for i in range(num_points + 1):
        trend = log_open + (i / num_points) * (log_close - log_open)
        bridge_noise = walk[i] - (i / num_points) * total_drift
        prices.append(math.exp(trend + bridge_noise))

    start, end = _session_window(asset["type"], day)
    step = (end - start) / num_points
    candles = []
    for i in range(num_points):
        o, c = prices[i], prices[i + 1]
        wick = abs(rng.gauss(0, sigma_step * 0.6))
        high = max(o, c) * (1 + wick)
        low = min(o, c) * (1 - wick)
        volume = int(_base_volume(asset) / num_points * rng.uniform(0.4, 1.8))
        candles.append({
            "t": int((start + step * i).timestamp()),
            "o": round(o, 8), "h": round(high, 8), "l": round(low, 8), "c": round(c, 8), "v": volume,
        })
    return candles


def _daily_point_to_candle(point):
    ts = int(datetime.combine(point["date"], datetime.min.time(), tzinfo=timezone.utc).timestamp())
    return {
        "t": ts, "o": round(point["o"], 8), "h": round(point["h"], 8),
        "l": round(point["l"], 8), "c": round(point["c"], 8), "v": point["v"],
    }


def _simulated_history(symbol, asset, range_key):
    today = datetime.now(timezone.utc).date()
    series = _simulate_daily_series(symbol, asset, today)

    if range_key in ("1D", "1W"):
        if range_key == "1D":
            num_days, points_per_day = 1, (288 if asset["type"] == "crypto" else 78)
        else:
            num_days, points_per_day = min(7, len(series) - 1), 12
        start_idx = max(len(series) - num_days, 1)
        candles = []
        for idx in range(start_idx, len(series)):
            day = series[idx]
            prev_close = series[idx - 1]["c"]
            candles.extend(_simulate_session_candles(symbol, asset, day["date"], prev_close, day["c"], points_per_day))
    else:
        window_days = {"1M": 30, "3M": 90, "1Y": 365, "ALL": None}[range_key]
        points = series if window_days is None else series[-window_days:]
        if range_key == "ALL":
            points = points[::5]  # thin to a lighter, weekly-ish resolution
        candles = [_daily_point_to_candle(p) for p in points]

    return {
        "symbol": symbol,
        "range": range_key,
        "interval": HISTORY_INTERVAL_LABEL[range_key],
        "source": "simulated",
        "candles": candles,
    }
