from datetime import datetime, timedelta

# (days_ago, symbol, side, quantity, price) — a hand-authored order history for
# the Demo user, replayed to derive consistent transactions/holdings/cash.
DEMO_ORDERS = [
    (178, "AAPL", "buy", 25, 182.30),
    (165, "MSFT", "buy", 8, 415.00),
    (150, "NVDA", "buy", 15, 118.75),
    (140, "BTC-USD", "buy", 0.15, 61200.00),
    (125, "TSLA", "buy", 10, 230.00),
    (110, "ETH-USD", "buy", 1.2, 3450.00),
    (95, "AAPL", "sell", 10, 198.50),
    (88, "AMD", "buy", 20, 172.40),
    (75, "JPM", "buy", 12, 208.00),
    (60, "NVDA", "sell", 5, 128.90),
    (50, "AMZN", "buy", 10, 198.60),
    (35, "DIS", "buy", 15, 91.20),
    (20, "BTC-USD", "sell", 0.05, 66500.00),
    (8, "SOL-USD", "buy", 8, 150.00),
]

DEMO_WATCHLIST = ["GOOGL", "META", "XOM", "ADA-USD", "LINK-USD", "UBER"]


def compute_demo_state(starting_cash):
    """Replay DEMO_ORDERS to derive ending cash, resulting holdings, and the
    transaction rows to insert. Mirrors the weighted-avg-cost order math the
    trading API uses, so seeded data stays consistent with live trades."""
    cash = starting_cash
    positions = {}
    now = datetime.utcnow()
    transactions = []

    for days_ago, symbol, side, quantity, price in DEMO_ORDERS:
        total = round(quantity * price, 2)
        transactions.append({
            "symbol": symbol,
            "side": side,
            "quantity": quantity,
            "price": price,
            "total": total,
            "created_at": now - timedelta(days=days_ago),
        })

        position = positions.setdefault(symbol, {"quantity": 0.0, "avg_cost": 0.0})
        if side == "buy":
            new_quantity = position["quantity"] + quantity
            position["avg_cost"] = (
                (position["avg_cost"] * position["quantity"]) + (price * quantity)
            ) / new_quantity
            position["quantity"] = new_quantity
            cash -= total
        else:
            position["quantity"] -= quantity
            cash += total

    holdings = {
        symbol: position for symbol, position in positions.items()
        if position["quantity"] > 0
    }

    return {
        "cash_balance": round(cash, 2),
        "holdings": holdings,
        "transactions": transactions,
    }
