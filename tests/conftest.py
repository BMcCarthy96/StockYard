import os

# Must happen before `app` is ever imported: Config reads these at class
# definition time, and db.py's schema-prefix `environment` flag is derived
# from FLASK_DEBUG at import time.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["FLASK_DEBUG"] = "1"
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("SCHEMA", "test_schema")

import pytest

from app import app as flask_app
from app.models import db as _db


@pytest.fixture()
def app_ctx():
    flask_app.config["TESTING"] = True
    with flask_app.app_context():
        _db.create_all()
        yield flask_app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture()
def user(app_ctx):
    from app.models import User
    u = User(username="tester", email="tester@example.com", password="password", cash_balance=10000.00)
    _db.session.add(u)
    _db.session.commit()
    return u
