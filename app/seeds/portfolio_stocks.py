from app.models import db, PortfolioStock
from datetime import datetime

def seed_portfolio_stocks():
    portfolio_stock1 = PortfolioStock(portfolio_id=1, stock_id=1, quantity=10, purchase_price=190.42, purchase_date=datetime(2023, 10, 1))
    portfolio_stock2 = PortfolioStock(portfolio_id=1, stock_id=2, quantity=5, purchase_price=155.37, purchase_date=datetime(2023, 10, 2))
    db.session.add_all([portfolio_stock1, portfolio_stock2])
    db.session.commit()

def undo_portfolio_stocks():
    db.session.execute("DELETE FROM portfolio_stocks")
    db.session.commit()
