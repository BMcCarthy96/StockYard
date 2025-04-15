from .db import db

class Stock(db.Model):
    __tablename__ = 'stocks'

    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), nullable=False)
    ticker = db.Column(db.String(10), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    exchange = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    exchange = db.Column(db.String(10), nullable=False)
    sector = db.Column(db.String(50), nullable=False)

    portfolio=db.relationship('Portfolio', back_populates='stocks')
    watchlist_stocks = db.relationship('WatchlistStock', back_populates='stock')

    def __repr__(self):
        return f'<Stock {self.ticker}>'
