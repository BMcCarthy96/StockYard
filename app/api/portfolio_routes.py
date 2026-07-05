from flask import Blueprint, request
from flask_login import login_required, current_user

from app.services.portfolio import get_portfolio_summary, get_portfolio_history

portfolio_routes = Blueprint('portfolio', __name__)


@portfolio_routes.route('/', methods=['GET'])
@login_required
def portfolio_summary():
    return get_portfolio_summary(current_user)


@portfolio_routes.route('/history', methods=['GET'])
@login_required
def portfolio_history():
    range_key = request.args.get('range', '1M')
    return get_portfolio_history(current_user, range_key)
