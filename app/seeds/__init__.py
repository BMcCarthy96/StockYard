from flask.cli import AppGroup
from .users import seed_users, undo_users
from .transactions import seed_transactions, undo_transactions
from .holdings import seed_holdings, undo_holdings
from .watchlist_items import seed_watchlist_items, undo_watchlist_items

from app.models import User
from app.models.db import db, environment, SCHEMA


seed_commands = AppGroup('seed')


def _undo_all():
    undo_watchlist_items()
    undo_holdings()
    undo_transactions()
    undo_users()


def _seed_all():
    seed_users()
    seed_transactions()
    seed_holdings()
    seed_watchlist_items()


@seed_commands.command('all')
def seed():
    if environment == 'production':
        _undo_all()
    _seed_all()


@seed_commands.command('undo')
def undo():
    _undo_all()


@seed_commands.command('ensure')
def ensure_seeded():
    """Seeds demo data only if the database is empty. Safe to run on every
    container start (unlike `seed all`, which wipes existing data in
    production) so real signups/trades survive a redeploy or restart."""
    if User.query.count() == 0:
        _seed_all()
