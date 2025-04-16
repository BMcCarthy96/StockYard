from .db import db, environment, SCHEMA, add_prefix_for_prod

class Portfolio(db.Model):
    __tablename__ = 'portfolios'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    balance = db.Column(db.Float, nullable=True)

    user = db.relationship('User', back_populates='portfolios')
    transactions = db.relationship('Transaction', back_populates='portfolio', cascade='all, delete-orphan')
    portfolio_stocks = db.relationship('PortfolioStock', back_populates='portfolio', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Portfolio {self.id}>'
