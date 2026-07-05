from flask_sqlalchemy import SQLAlchemy

import os

# Flask 2.3 dropped FLASK_ENV; FLASK_DEBUG is the supported signal for which
# environment we're running in. Locally .env sets FLASK_DEBUG=1; Render (or
# any other production host) should leave it unset.
environment = "development" if os.environ.get("FLASK_DEBUG") == "1" else "production"
SCHEMA = os.environ.get("SCHEMA", "public")


db = SQLAlchemy()

# helper function for adding prefix to foreign key column references in production
def add_prefix_for_prod(attr):
    if environment == "production":
        return f"{SCHEMA}.{attr}"
    else:
        return attr
