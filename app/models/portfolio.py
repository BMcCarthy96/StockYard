<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
from .db import db, environment, SCHEMA, add_prefix_for_prod
=======
<<<<<<< HEAD
=======
from .db import db
>>>>>>> bdf008d (Modified login styling to match signup)
=======
=======
>>>>>>> 6061f4a (Modified login styling to match signup)
<<<<<<< HEAD
=======
from .db import db
=======
from .db import db, environment, SCHEMA, add_prefix_for_prod
>>>>>>> 2268bc7 (Rebased)
<<<<<<< HEAD
>>>>>>> 94b375f (Rebased)
=======
=======
from .db import db, environment, SCHEMA, add_prefix_for_prod
=======
from .db import db
>>>>>>> ef081c6 (Modified login styling to match signup)
>>>>>>> 73157a9 (Modified login styling to match signup)
>>>>>>> 6061f4a (Modified login styling to match signup)

class Portfolio(db.Model):
    __tablename__ = 'portfolios'

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6061f4a (Modified login styling to match signup)
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False, unique=True)
    cash_balance = db.Column(db.Float, default=0.0)
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> 572533a (migration and jsx done)
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": self.balance
=======
<<<<<<< HEAD
=======
=======
>>>>>>> 6061f4a (Modified login styling to match signup)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0.0)

    user = db.relationship('User', back_populates='portfolios')
<<<<<<< HEAD
>>>>>>> bdf008d (Modified login styling to match signup)
=======
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False, unique=True)
    cash_balance = db.Column(db.Float, default=0.0)
<<<<<<< HEAD

<<<<<<< HEAD
    user = db.relationship("User", back_populates="portfolio")
>>>>>>> 94b375f (Rebased)

=======
>>>>>>> 5fdda3a (Rebased)
=======

>>>>>>> 6061f4a (Modified login styling to match signup)
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            'cash_balance': self.cash_balance
>>>>>>> d807041 (added to models)
=======
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": self.balance
>>>>>>> 9a957cc (updated seeders and other files)
        }
=======
            'balance': self.balance,
=======
            'cash_balance': self.cash_balance
>>>>>>> 94b375f (Rebased)
=======
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": self.balance
>>>>>>> e5b7873 (updated seeders and other files)
=======
            'balance': self.balance,
>>>>>>> ef081c6 (Modified login styling to match signup)
>>>>>>> 6061f4a (Modified login styling to match signup)
        }
>>>>>>> 30411c3 (Modified login styling to match signup)
>>>>>>> bdf008d (Modified login styling to match signup)
