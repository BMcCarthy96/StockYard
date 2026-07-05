from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.assets import get_asset
from app.models import Transaction, Holding
from app.models.user import STARTING_CASH_BALANCE
from app.services.market_data import get_quotes, get_history, TTLCache

RANGE_WINDOW_DAYS = {"1W": 7, "1M": 30, "3M": 90, "1Y": 365, "ALL": None}
HISTORY_CACHE_TTL = 300

_history_cache = TTLCache()


def get_portfolio_summary(user):
    holdings = Holding.query.filter_by(user_id=user.id).all()
    symbols = [h.symbol for h in holdings]
    quotes = get_quotes(symbols)['quotes'] if symbols else {}

    holding_payloads = []
    total_market_value = Decimal('0')
    total_cost_basis = Decimal('0')

    for h in holdings:
        quote = quotes.get(h.symbol)
        asset = get_asset(h.symbol)
        price = Decimal(str(quote['price'])) if quote else h.avg_cost
        market_value = h.quantity * price
        cost_basis = h.quantity * h.avg_cost
        unrealized_pl = market_value - cost_basis
        unrealized_pl_percent = (unrealized_pl / cost_basis * 100) if cost_basis else Decimal('0')

        holding_payloads.append({
            "symbol": h.symbol,
            "name": asset['name'] if asset else h.symbol,
            "type": asset['type'] if asset else 'stock',
            "quantity": float(h.quantity),
            "avg_cost": round(float(h.avg_cost), 8),
            "current_price": round(float(price), 8),
            "market_value": round(float(market_value), 2),
            "unrealized_pl": round(float(unrealized_pl), 2),
            "unrealized_pl_percent": round(float(unrealized_pl_percent), 4),
            "day_change_percent": round(quote['changePercent'], 4) if quote else 0.0,
            "source": quote['source'] if quote else 'simulated',
        })
        total_market_value += market_value
        total_cost_basis += cost_basis

    total_unrealized_pl = total_market_value - total_cost_basis
    total_unrealized_pl_percent = (
        (total_unrealized_pl / total_cost_basis * 100) if total_cost_basis else Decimal('0')
    )
    total_value = user.cash_balance + total_market_value

    return {
        "cash_balance": round(float(user.cash_balance), 2),
        "holdings": holding_payloads,
        "total_value": round(float(total_value), 2),
        "total_market_value": round(float(total_market_value), 2),
        "total_cost_basis": round(float(total_cost_basis), 2),
        "total_unrealized_pl": round(float(total_unrealized_pl), 2),
        "total_unrealized_pl_percent": round(float(total_unrealized_pl_percent), 4),
    }


def _source_range_for_window(days_needed):
    if days_needed <= 30:
        return "1M"
    if days_needed <= 90:
        return "3M"
    if days_needed <= 365:
        return "1Y"
    return "ALL"


def _daily_close_lookup(symbol, days_needed):
    history = get_history(symbol, _source_range_for_window(days_needed))
    lookup = {}
    for candle in history["candles"]:
        d = datetime.fromtimestamp(candle["t"], tz=timezone.utc).date()
        lookup[d] = candle["c"]
    return lookup


def _compute_portfolio_history(user, range_key):
    today = datetime.now(timezone.utc).date()
    window_days = RANGE_WINDOW_DAYS[range_key]
    transactions = (
        Transaction.query.filter_by(user_id=user.id).order_by(Transaction.created_at.asc()).all()
    )

    if window_days is not None:
        start_date = today - timedelta(days=window_days)
    elif transactions:
        start_date = transactions[0].created_at.date()
    else:
        start_date = today - timedelta(days=30)

    days_needed = max((today - start_date).days, 1)
    symbols = sorted({t.symbol for t in transactions})
    close_lookup = {symbol: _daily_close_lookup(symbol, days_needed) for symbol in symbols}
    last_close = {symbol: None for symbol in symbols}

    cash = Decimal(str(STARTING_CASH_BALANCE))
    holdings_qty = {}
    txn_idx = 0
    points = []

    current_date = start_date
    while current_date <= today:
        while txn_idx < len(transactions) and transactions[txn_idx].created_at.date() <= current_date:
            t = transactions[txn_idx]
            if t.side == 'buy':
                cash -= t.total
                holdings_qty[t.symbol] = holdings_qty.get(t.symbol, Decimal('0')) + t.quantity
            else:
                cash += t.total
                holdings_qty[t.symbol] = holdings_qty.get(t.symbol, Decimal('0')) - t.quantity
            txn_idx += 1

        market_value = Decimal('0')
        for symbol, qty in holdings_qty.items():
            if qty <= 0:
                continue
            close = close_lookup.get(symbol, {}).get(current_date)
            if close is not None:
                last_close[symbol] = close
            price = last_close.get(symbol)
            if price is not None:
                market_value += qty * Decimal(str(price))

        total_value = cash + market_value
        points.append({
            "t": int(datetime.combine(current_date, datetime.min.time(), tzinfo=timezone.utc).timestamp()),
            "value": round(float(total_value), 2),
        })
        current_date += timedelta(days=1)

    return {"range": range_key, "points": points}


def get_portfolio_history(user, range_key):
    range_key = range_key.upper() if range_key and range_key.upper() in RANGE_WINDOW_DAYS else "1M"
    return _history_cache.get_or_set(
        ("portfolio_history", user.id, range_key), HISTORY_CACHE_TTL,
        lambda: _compute_portfolio_history(user, range_key),
    )
