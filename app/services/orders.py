from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from app.assets import is_valid_symbol
from app.models import db, Holding, Transaction
from app.services.market_data import get_quotes

TWO_PLACES = Decimal('0.01')
EIGHT_PLACES = Decimal('0.00000001')


class OrderError(Exception):
    """Raised for any order validation/execution failure; carries a field
    -> message dict so routes can return it as {"errors": ...}."""

    def __init__(self, errors):
        super().__init__(str(errors))
        self.errors = errors


def _to_decimal(value):
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None


def execute_order(user, symbol, side, quantity=None, notional=None):
    if not symbol or not is_valid_symbol(symbol):
        raise OrderError({"symbol": "Unknown symbol"})
    if side not in ('buy', 'sell'):
        raise OrderError({"side": 'Side must be "buy" or "sell"'})
    if (quantity is None) == (notional is None):
        raise OrderError({"quantity": "Provide exactly one of quantity or notional"})

    quote = get_quotes([symbol])['quotes'].get(symbol)
    if quote is None:
        raise OrderError({"symbol": "No quote available for this symbol"})
    price = _to_decimal(quote['price'])

    if notional is not None:
        notional_dec = _to_decimal(notional)
        if notional_dec is None or notional_dec <= 0:
            raise OrderError({"notional": "Must be a positive number"})
        order_quantity = (notional_dec / price).quantize(EIGHT_PLACES, rounding=ROUND_HALF_UP)
    else:
        order_quantity = _to_decimal(quantity)
        if order_quantity is None or order_quantity <= 0:
            raise OrderError({"quantity": "Must be a positive number"})
        order_quantity = order_quantity.quantize(EIGHT_PLACES, rounding=ROUND_HALF_UP)

    if order_quantity <= 0:
        raise OrderError({"quantity": "Order size too small"})

    total = (order_quantity * price).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)
    holding = Holding.query.filter_by(user_id=user.id, symbol=symbol).first()

    if side == 'buy':
        if total > user.cash_balance:
            raise OrderError({"total": "Insufficient cash balance"})
        if holding is None:
            holding = Holding(user_id=user.id, symbol=symbol, quantity=order_quantity, avg_cost=price)
            db.session.add(holding)
        else:
            new_quantity = holding.quantity + order_quantity
            new_cost_basis = (holding.avg_cost * holding.quantity) + (price * order_quantity)
            holding.avg_cost = (new_cost_basis / new_quantity).quantize(EIGHT_PLACES, rounding=ROUND_HALF_UP)
            holding.quantity = new_quantity
        user.cash_balance = user.cash_balance - total
        result_holding = holding
    else:
        if holding is None or order_quantity > holding.quantity:
            raise OrderError({"quantity": "Cannot sell more than you hold"})
        holding.quantity = holding.quantity - order_quantity
        user.cash_balance = user.cash_balance + total
        if holding.quantity == 0:
            db.session.delete(holding)
            result_holding = None
        else:
            result_holding = holding

    transaction = Transaction(
        user_id=user.id, symbol=symbol, side=side,
        quantity=order_quantity, price=price, total=total,
    )
    db.session.add(transaction)
    db.session.commit()

    return {
        "transaction": transaction.to_dict(),
        "holding": result_holding.to_dict() if result_holding else None,
        "cash_balance": round(float(user.cash_balance), 2),
    }
