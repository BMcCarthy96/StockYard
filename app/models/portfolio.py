from .db import db

class Portfolio(db.Model):
    __tablename__ = 'portfolios'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    balance = db.Column(db.Float, nullable=True)
    stocks = db.relationship('Stock', back_populates='portfolio')

    user = db.relationship("User", back_populates="portfolio")

    def __repr__(self):
        return f'<Portfolio {self.id}>'
