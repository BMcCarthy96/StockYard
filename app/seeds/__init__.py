from flask.cli import AppGroup
from .users import seed_users, undo_users
from .transactions import seed_transactions, undo_transactions
from .holdings import seed_holdings, undo_holdings
from .watchlist_items import seed_watchlist_items, undo_watchlist_items

from app.models.db import db, environment, SCHEMA


seed_commands = AppGroup('seed')


def _undo_all():
    undo_watchlist_items()
    undo_holdings()
    undo_transactions()
    undo_users()


@seed_commands.command('all')
def seed():
    if environment == 'production':
        _undo_all()
    seed_users()
    seed_transactions()
    seed_holdings()
    seed_watchlist_items()


@seed_commands.command('undo')
def undo():
    _undo_all()
