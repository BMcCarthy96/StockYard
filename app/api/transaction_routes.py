from flask import Blueprint, request
from flask_login import login_required, current_user

from app.models import Transaction

transaction_routes = Blueprint('transactions', __name__)


@transaction_routes.route('/', methods=['GET'])
@login_required
def list_transactions():
    query = Transaction.query.filter_by(user_id=current_user.id)

    symbol = request.args.get('symbol')
    if symbol:
        query = query.filter(Transaction.symbol == symbol)

    side = request.args.get('side')
    if side in ('buy', 'sell'):
        query = query.filter(Transaction.side == side)

    page = max(request.args.get('page', 1, type=int), 1)
    per_page = min(max(request.args.get('per_page', 20, type=int), 1), 100)

    query = query.order_by(Transaction.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return {
        "transactions": [t.to_dict() for t in pagination.items],
        "page": pagination.page,
        "pages": pagination.pages,
        "total": pagination.total,
    }
