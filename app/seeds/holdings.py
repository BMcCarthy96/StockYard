from app.models import db, User, Holding, environment, SCHEMA
from app.models.user import STARTING_CASH_BALANCE
from sqlalchemy.sql import text
from .demo_activity import compute_demo_state


def seed_holdings():
    demo = User.query.filter(User.username == 'Demo').first()
    if not demo:
        return

    state = compute_demo_state(STARTING_CASH_BALANCE)
    for symbol, position in state["holdings"].items():
        db.session.add(Holding(
            user_id=demo.id,
            symbol=symbol,
            quantity=position["quantity"],
            avg_cost=position["avg_cost"],
        ))
    db.session.commit()


def undo_holdings():
    if environment == "production":
        db.session.execute(text(f'TRUNCATE table "{SCHEMA}".holdings RESTART IDENTITY CASCADE;'))
    else:
        db.session.execute(text("DELETE FROM holdings"))
    db.session.commit()
