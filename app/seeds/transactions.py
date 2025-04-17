from app.models import db, Transaction
from datetime import datetime

def seed_transactions():
    transaction1 = Transaction(
        portfolio_stock_id=1,
        transaction_type="buy",
        quantity=10,
        price_per_share=190.42,
        total_value=1904.20,
        transaction_date=datetime(2023, 10, 1),
    )
    transaction2 = Transaction(
        portfolio_stock_id=2,
        transaction_type="sell",
        quantity=5,
        price_per_share=155.37,
        total_value=776.85,
        transaction_date=datetime(2023, 10, 2),
    )
    db.session.add_all([transaction1, transaction2])
    db.session.commit()
def undo_transactions():
    db.session.execute("DELETE FROM transactions")
    db.session.commit()
