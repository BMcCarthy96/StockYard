from dotenv import load_dotenv

# Load .env before any module below reads os.environ — relying on Flask CLI's
# implicit dotenv loading only works when the app is launched via `flask ...`;
# gunicorn, pytest, and plain scripts need this explicit call.
load_dotenv()

from flask import Flask, request, redirect
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect, CSRFError, generate_csrf
from flask_login import LoginManager
from .models import db, User, environment
from .api.auth_routes import auth_routes
from .api.market_routes import market_routes
from .api.portfolio_routes import portfolio_routes
from .api.watchlist_routes import watchlist_routes
from .api.order_routes import order_routes
from .api.transaction_routes import transaction_routes
from .seeds import seed_commands
from .config import Config


app = Flask(__name__, static_folder='../react-vite/dist', static_url_path='/')

# Setup login manager
login = LoginManager(app)
login.login_view = 'auth.unauthorized'


@login.user_loader
def load_user(id_num):
    return User.query.get(int(id_num))


# Tell flask about our seed commands
app.cli.add_command(seed_commands)

app.config.from_object(Config)
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(market_routes, url_prefix='/api/market')
app.register_blueprint(portfolio_routes, url_prefix='/api/portfolio')
app.register_blueprint(watchlist_routes, url_prefix='/api/watchlist')
app.register_blueprint(order_routes, url_prefix='/api/orders')
app.register_blueprint(transaction_routes, url_prefix='/api/transactions')
db.init_app(app)
Migrate(app, db)

# Application Security
CORS(app)
CSRFProtect(app)


# Since we are deploying with Docker and Flask, we won't be using a
# buildpack when we deploy to Render. Therefore, we need to make sure
# that in production any request made over http is redirected to https.
@app.before_request
def https_redirect():
    if environment == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            return redirect(url, code=301)


@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=environment == 'production',
        samesite='Lax',
        httponly=False)
    return response


@app.route("/api/docs")
def api_help():
    """
    Returns all API routes and their doc strings
    """
    acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    route_list = { rule.rule: [[ method for method in rule.methods if method in acceptable_methods ],
                    app.view_functions[rule.endpoint].__doc__ ]
                    for rule in app.url_map.iter_rules() if rule.endpoint != 'static' }
    return route_list


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def react_root(path):
    """
    Serves the React build's index.html for any route Flask itself doesn't
    handle, so client-side routing (React Router) takes over. Real static
    assets (JS/CSS/favicon) are already served by Flask's static handler
    before this route is ever reached.
    """
    return app.send_static_file('index.html')


@app.errorhandler(404)
def not_found(_):
    return app.send_static_file('index.html')


@app.errorhandler(CSRFError)
def csrf_error(e):
    return {"errors": {"csrf_token": e.description}}, 400
