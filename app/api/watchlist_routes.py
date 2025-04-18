from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Watchlist, WatchlistStock

watchlist_routes = Blueprint('watchlist', __name__)

@watchlist_routes.route('/watchlist', methods=['GET'])
@login_required
def get_watchlist():
    watchlist = WatchlistStock.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'stock_id': item.stock_id,
        'symbol': item.stock.symbol,
        'name': item.stock.name
    } for item in watchlist])


@watchlist_routes.route('/watchlist', methods=['POST'])
@login_required
def add_to_watchlist():
    data = request.get_json()
    stock_id = data.get('stock_id')

    if not stock_id:
        return jsonify({'error': 'Stock ID is required'}), 400

    # Prevent duplicates
    existing = WatchlistStock.query.filter_by(user_id=current_user.id, stock_id=stock_id).first()
    if existing:
        return jsonify({'message': 'Stock already in watchlist'}), 200

    new_watch = WatchlistStock(user_id=current_user.id, stock_id=stock_id)
    db.session.add(new_watch)
    db.session.commit()
    return jsonify({'message': 'Stock added to watchlist'}), 201


@watchlist_routes.route('/watchlist/<int:stock_id>', methods=['DELETE'])
@login_required
def remove_from_watchlist(stock_id):
    watch_item = WatchlistStock.query.filter_by(user_id=current_user.id, stock_id=stock_id).first()
    if not watch_item:
        return jsonify({'error': 'Stock not found in watchlist'}), 404

    db.session.delete(watch_item)
    db.session.commit()
    return jsonify({'message': 'Stock removed from watchlist'}), 200
