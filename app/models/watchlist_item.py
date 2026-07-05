from datetime import datetime
from .db import db, environment, SCHEMA, add_prefix_for_prod


class WatchlistItem(db.Model):
    __tablename__ = 'watchlist_items'

    if environment == "production":
        __table_args__ = (
            db.UniqueConstraint('user_id', 'symbol', name='uq_watchlist_user_symbol'),
            {'schema': SCHEMA},
        )
    else:
        __table_args__ = (
            db.UniqueConstraint('user_id', 'symbol', name='uq_watchlist_user_symbol'),
        )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User', back_populates='watchlist_items')

    def to_dict(self):
        return {
            'id': self.id,
            'symbol': self.symbol,
            'created_at': self.created_at.isoformat(),
        }
