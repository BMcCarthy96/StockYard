from flask.cli import AppGroup
from .users import seed_users, undo_users
from .portfolio_stocks import seed_portfolio_stocks, undo_portfolio_stocks
from .portfolios import seed_portfolios, undo_portfolios
from .stocks import seed_stocks, undo_stocks
from .transactions import seed_transactions, undo_transactions
from .watchlists import seed_watchlists, undo_watchlists
from .watchlist_stocks import seed_watchlist_stocks, undo_watchlist_stocks

from app.models.db import db, environment, SCHEMA


seed_commands = AppGroup('seed')


@seed_commands.command('all')
def seed():
    if environment == 'production':
        # Before seeding in production, you want to run the seed undo
        # command, which will  truncate all tables prefixed with
        # the schema name (see comment in users.py undo_users function).
        # Make sure to add all your other model's undo functions below
        undo_users()
        undo_portfolio_stocks()
        undo_portfolios()
        undo_stocks()
        undo_transactions()
        undo_watchlists()
        undo_watchlist_stocks()
    seed_users()
    seed_portfolio_stocks()
    seed_portfolios()
    seed_stocks()
    seed_transactions()
    seed_watchlists()
    seed_watchlist_stocks()
    # Add other seed functions here


@seed_commands.command('undo')
def undo():
    undo_portfolios()
    undo_users()
    undo_portfolio_stocks()
    undo_portfolios()
    undo_stocks()
    undo_transactions()
    undo_watchlists()
    undo_watchlist_stocks()
    # Add other undo functions here
