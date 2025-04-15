from .login_form import LoginForm
from .signup_form import SignUpForm
from .api.stock_routes import stock_routes
app.register_blueprint(stock_routes, url_prefix='/api/stocks')
