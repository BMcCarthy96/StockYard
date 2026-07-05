from flask import Blueprint, request
from flask_login import login_required, current_user

from app.assets import is_valid_symbol
from app.models import db, WatchlistItem

watchlist_routes = Blueprint('watchlist', __name__)


@watchlist_routes.route('/', methods=['GET'])
@login_required
def get_watchlist():
    items = WatchlistItem.query.filter_by(user_id=current_user.id).order_by(WatchlistItem.created_at.asc()).all()
    return {"items": [item.to_dict() for item in items]}


@watchlist_routes.route('/', methods=['POST'])
@login_required
def add_to_watchlist():
    data = request.get_json(silent=True) or {}
    symbol = data.get('symbol')
    if not symbol or not is_valid_symbol(symbol):
        return {"errors": {"symbol": "Unknown symbol"}}, 400

    existing = WatchlistItem.query.filter_by(user_id=current_user.id, symbol=symbol).first()
    if existing:
        return {"errors": {"symbol": "Already in watchlist"}}, 409

    item = WatchlistItem(user_id=current_user.id, symbol=symbol)
    db.session.add(item)
    db.session.commit()
    return item.to_dict(), 201


@watchlist_routes.route('/<string:symbol>', methods=['DELETE'])
@login_required
def remove_from_watchlist(symbol):
    item = WatchlistItem.query.filter_by(user_id=current_user.id, symbol=symbol).first()
    if not item:
        return {"errors": {"symbol": "Not in watchlist"}}, 404

    db.session.delete(item)
    db.session.commit()
    return {"message": "Removed from watchlist"}
