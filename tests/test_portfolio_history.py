from datetime import datetime, timedelta, timezone

import pytest

from app.models import db, Transaction
from app.services import portfolio as portfolio_service


@pytest.fixture(autouse=True)
def _clear_history_cache():
    # The module-level TTL cache would otherwise leak state between tests
    # that reuse the same (fresh in-memory DB) user id.
    portfolio_service._history_cache._store.clear()
    yield
    portfolio_service._history_cache._store.clear()


def _stub_history(monkeypatch, prices_by_symbol):
    """Every candle for a symbol returns the same flat close price."""
    def fake_get_history(symbol, range_key):
        price = prices_by_symbol[symbol]
        today = datetime.now(timezone.utc).date()
        candles = []
        for i in range(400):
            d = today - timedelta(days=399 - i)
            ts = int(datetime.combine(d, datetime.min.time(), tzinfo=timezone.utc).timestamp())
            candles.append({"t": ts, "o": price, "h": price, "l": price, "c": price, "v": 1000})
        return {"symbol": symbol, "range": range_key, "interval": "1d", "source": "simulated", "candles": candles}
    monkeypatch.setattr(portfolio_service, "get_history", fake_get_history)


def test_flat_before_any_transactions(user, monkeypatch):
    _stub_history(monkeypatch, {})
    result = portfolio_service.get_portfolio_history(user, "1M")
    assert len(result["points"]) > 0
    assert all(p["value"] == 100000.0 for p in result["points"])


def test_flat_before_first_transaction_then_reflects_buy(user, monkeypatch):
    _stub_history(monkeypatch, {"AAPL": 100.0})
    ten_days_ago = datetime.now(timezone.utc) - timedelta(days=10)
    db.session.add(Transaction(
        user_id=user.id, symbol="AAPL", side="buy",
        quantity=10, price=100.0, total=1000.0, created_at=ten_days_ago,
    ))
    db.session.commit()

    result = portfolio_service.get_portfolio_history(user, "1M")
    txn_ts = int(ten_days_ago.timestamp())
    before = [p for p in result["points"] if p["t"] < txn_ts]
    after = [p for p in result["points"] if p["t"] >= txn_ts]

    assert before, "expected at least one point before the transaction"
    assert all(p["value"] == 100000.0 for p in before)
    # price never moved: cash 9000 (100000-1000) + 10 shares * 100 = 100000
    assert all(p["value"] == 100000.0 for p in after)


def test_replay_reflects_price_appreciation(user, monkeypatch):
    ten_days_ago = datetime.now(timezone.utc) - timedelta(days=10)
    db.session.add(Transaction(
        user_id=user.id, symbol="AAPL", side="buy",
        quantity=10, price=100.0, total=1000.0, created_at=ten_days_ago,
    ))
    db.session.commit()

    _stub_history(monkeypatch, {"AAPL": 150.0})
    result = portfolio_service.get_portfolio_history(user, "1M")
    last_point = result["points"][-1]
    # cash 99000 + 10 shares * 150 = 100500
    assert last_point["value"] == 100500.0


def test_sell_credits_cash_and_reduces_position(user, monkeypatch):
    ten_days_ago = datetime.now(timezone.utc) - timedelta(days=10)
    five_days_ago = datetime.now(timezone.utc) - timedelta(days=5)
    db.session.add_all([
        Transaction(user_id=user.id, symbol="AAPL", side="buy", quantity=10, price=100.0,
                    total=1000.0, created_at=ten_days_ago),
        Transaction(user_id=user.id, symbol="AAPL", side="sell", quantity=4, price=110.0,
                    total=440.0, created_at=five_days_ago),
    ])
    db.session.commit()

    _stub_history(monkeypatch, {"AAPL": 110.0})
    result = portfolio_service.get_portfolio_history(user, "1M")
    last_point = result["points"][-1]
    # cash: 100000 - 1000 + 440 = 99440; holdings: 6 * 110 = 660; total = 100100
    assert last_point["value"] == 100100.0


def test_unknown_range_falls_back_to_1M(user, monkeypatch):
    _stub_history(monkeypatch, {})
    result = portfolio_service.get_portfolio_history(user, "bogus")
    assert result["range"] == "1M"
