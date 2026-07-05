from app.models import db, User, Transaction, environment, SCHEMA
from app.models.user import STARTING_CASH_BALANCE
from sqlalchemy.sql import text
from .demo_activity import compute_demo_state


def seed_transactions():
    demo = User.query.filter(User.username == 'Demo').first()
    if not demo:
        return

    state = compute_demo_state(STARTING_CASH_BALANCE)
    for row in state["transactions"]:
        db.session.add(Transaction(
            user_id=demo.id,
            symbol=row["symbol"],
            side=row["side"],
            quantity=row["quantity"],
            price=row["price"],
            total=row["total"],
            created_at=row["created_at"],
        ))

    demo.cash_balance = state["cash_balance"]
    db.session.commit()


def undo_transactions():
    if environment == "production":
        db.session.execute(text(f'TRUNCATE table "{SCHEMA}".transactions RESTART IDENTITY CASCADE;'))
    else:
        db.session.execute(text("DELETE FROM transactions"))
    db.session.commit()
