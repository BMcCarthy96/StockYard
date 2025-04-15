from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Watchlist, Portfolio

stock_routes = Blueprint('stocks', __name__)

@stock_routes.route('/')
def get_stocks():
    stocks = [
        {"symbol": "AAPL", "price": 175.64, "change": "+1.35%"},
        {"symbol": "GOOG", "price": 135.12, "change": "-0.90%"},
        {"symbol": "MSFT", "price": 320.45, "change": "+0.98%"},
        {"symbol": "AMZN", "price": 135.67, "change": "+1.08%"},
        {"symbol": "NVDA", "price": 450.23, "change": "+1.28%"},
        {"symbol": "TSLA", "price": 245.12, "change": "-1.39%"},
        {"symbol": "PLTR", "price": 17.45, "change": "+4.00%"},
    ]
    return jsonify(stocks)

@stock_routes.route('/watchlist', methods=['POST'])
@login_required
def add_to_watchlist():
    data = request.json
    stock = Watchlist(user_id=current_user.id, symbol=data['symbol'])
    db.session.add(stock)
    db.session.commit()
    return {"message": "Stock added to watchlist"}

@stock_routes.route('/portfolio', methods=['POST'])
@login_required
def add_to_portfolio():
    data = request.json
    stock = Portfolio(user_id=current_user.id, symbol=data['symbol'])
    db.session.add(stock)
    db.session.commit()
    return {"message": "Stock added to portfolio"}

@stock_routes.route('/portfolio/<string:symbol>', methods=['DELETE'])
@login_required
def remove_from_portfolio(symbol):
    stock = Portfolio.query.filter_by(user_id=current_user.id, symbol=symbol).first()
    if stock:
        db.session.delete(stock)
        db.session.commit()
        return {"message": f"Stock {symbol} removed from portfolio"}
    return {"error": "Stock not found in portfolio"}, 404
