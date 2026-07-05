import pytest

from app.models import Holding
from app.services.orders import execute_order, OrderError


def _stub_quote(monkeypatch, price):
    def fake_get_quotes(symbols):
        return {"quotes": {s: {"price": price, "source": "simulated"} for s in symbols}, "asOf": "now"}
    monkeypatch.setattr("app.services.orders.get_quotes", fake_get_quotes)


def test_buy_creates_holding_and_debits_cash(user, monkeypatch):
    _stub_quote(monkeypatch, 100.0)
    result = execute_order(user, "AAPL", "buy", quantity=10)
    assert result["cash_balance"] == 9000.0
    holding = Holding.query.filter_by(user_id=user.id, symbol="AAPL").first()
    assert float(holding.quantity) == 10
    assert float(holding.avg_cost) == 100.0


def test_buy_weighted_average_cost(user, monkeypatch):
    _stub_quote(monkeypatch, 100.0)
    execute_order(user, "AAPL", "buy", quantity=10)
    _stub_quote(monkeypatch, 200.0)
    execute_order(user, "AAPL", "buy", quantity=10)
    holding = Holding.query.filter_by(user_id=user.id, symbol="AAPL").first()
    assert float(holding.quantity) == 20
    assert float(holding.avg_cost) == 150.0  # (10*100 + 10*200) / 20


def test_sell_partial_keeps_avg_cost(user, monkeypatch):
    _stub_quote(monkeypatch, 100.0)
    execute_order(user, "AAPL", "buy", quantity=10)
    _stub_quote(monkeypatch, 150.0)
    execute_order(user, "AAPL", "sell", quantity=4)
    holding = Holding.query.filter_by(user_id=user.id, symbol="AAPL").first()
    assert float(holding.quantity) == 6
    assert float(holding.avg_cost) == 100.0  # unaffected by sell price


def test_sell_full_removes_holding(user, monkeypatch):
    _stub_quote(monkeypatch, 100.0)
    execute_order(user, "AAPL", "buy", quantity=10)
    execute_order(user, "AAPL", "sell", quantity=10)
    assert Holding.query.filter_by(user_id=user.id, symbol="AAPL").first() is None


def test_oversell_rejected(user, monkeypatch):
    _stub_quote(monkeypatch, 100.0)
    execute_order(user, "AAPL", "buy", quantity=5)
    with pytest.raises(OrderError):
        execute_order(user, "AAPL", "sell", quantity=10)


def test_sell_with_no_holding_rejected(user, monkeypatch):
    _stub_quote(monkeypatch, 100.0)
    with pytest.raises(OrderError):
        execute_order(user, "AAPL", "sell", quantity=1)


def test_overbuy_rejected(user, monkeypatch):
    _stub_quote(monkeypatch, 100.0)
    with pytest.raises(OrderError):
        execute_order(user, "AAPL", "buy", quantity=1000)  # $100,000 > $10,000 cash


def test_notional_order_computes_quantity(user, monkeypatch):
    _stub_quote(monkeypatch, 50.0)
    execute_order(user, "AAPL", "buy", notional=500)
    holding = Holding.query.filter_by(user_id=user.id, symbol="AAPL").first()
    assert float(holding.quantity) == 10.0


def test_invalid_symbol_rejected(user):
    with pytest.raises(OrderError):
        execute_order(user, "NOTREAL", "buy", quantity=1)


def test_invalid_side_rejected(user):
    with pytest.raises(OrderError):
        execute_order(user, "AAPL", "hold", quantity=1)


def test_quantity_and_notional_both_given_rejected(user):
    with pytest.raises(OrderError):
        execute_order(user, "AAPL", "buy", quantity=1, notional=100)


def test_neither_quantity_nor_notional_rejected(user):
    with pytest.raises(OrderError):
        execute_order(user, "AAPL", "buy")
