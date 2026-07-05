from app.models import db, User, WatchlistItem, environment, SCHEMA
from sqlalchemy.sql import text
from .demo_activity import DEMO_WATCHLIST


def seed_watchlist_items():
    demo = User.query.filter(User.username == 'Demo').first()
    if not demo:
        return

    for symbol in DEMO_WATCHLIST:
        db.session.add(WatchlistItem(user_id=demo.id, symbol=symbol))
    db.session.commit()


def undo_watchlist_items():
    if environment == "production":
        db.session.execute(text(f'TRUNCATE table "{SCHEMA}".watchlist_items RESTART IDENTITY CASCADE;'))
    else:
        db.session.execute(text("DELETE FROM watchlist_items"))
    db.session.commit()
