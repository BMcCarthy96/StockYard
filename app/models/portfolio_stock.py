# models/portfolio_stock.py

from .db import db

class PortfolioStock(db.Model):
    __tablename__ = 'portfolio_stocks'

    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    purchase_price = db.Column(db.Float)
    purchase_date = db.Column(db.DateTime)

    portfolio = db.relationship('Portfolio', back_populates='portfolio_stocks')
    stock = db.relationship('Stock', back_populates='portfolio_stocks')
