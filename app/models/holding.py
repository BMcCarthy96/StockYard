from datetime import datetime
from .db import db, environment, SCHEMA, add_prefix_for_prod


class Holding(db.Model):
    __tablename__ = 'holdings'

    if environment == "production":
        __table_args__ = (
            db.UniqueConstraint('user_id', 'symbol', name='uq_holding_user_symbol'),
            {'schema': SCHEMA},
        )
    else:
        __table_args__ = (
            db.UniqueConstraint('user_id', 'symbol', name='uq_holding_user_symbol'),
        )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Numeric(24, 8), nullable=False)
    avg_cost = db.Column(db.Numeric(18, 8), nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', back_populates='holdings')

    def to_dict(self):
        return {
            'id': self.id,
            'symbol': self.symbol,
            'quantity': float(self.quantity),
            'avg_cost': round(float(self.avg_cost), 8),
        }
