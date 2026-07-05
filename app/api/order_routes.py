from flask import Blueprint, request
from flask_login import login_required, current_user

from app.services.orders import execute_order, OrderError

order_routes = Blueprint('orders', __name__)


@order_routes.route('/', methods=['POST'])
@login_required
def place_order():
    data = request.get_json(silent=True) or {}
    try:
        result = execute_order(
            current_user,
            symbol=data.get('symbol'),
            side=data.get('side'),
            quantity=data.get('quantity'),
            notional=data.get('notional'),
        )
        return result, 201
    except OrderError as e:
        return {"errors": e.errors}, 400
