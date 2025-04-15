from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Watchlist, Portfolio, PortfolioStock, Stock

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

@stock_routes.route('/<string:symbol>', methods=['GET'])
def get_stock_details(symbol):
    stock = Stock.query.filter_by(symbol=symbol.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404

    return jsonify(stock.to_dict())

@stock_routes.route('/search', methods=['GET'])
def search_stocks():
    query = request.args.get('q', '').strip()

    if not query:
        return jsonify({'error': 'Search query is required'}), 400

    results = Stock.query.filter(
        db.or_(
            Stock.name.ilike(f'%{query}%'),
            Stock.ticker.ilike(f'%{query}%')
        )
    ).all()

    return jsonify([{
        'id': stock.id,
        'ticker': stock.ticker,
        'name': stock.name,
        'price': stock.price
    } for stock in results]), 200


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
    stock_id = data.get('stock_id')
    quantity = data.get('quantity', 1)  # Default quantity to 1 if not provided

    # Ensure the stock exists
    stock = Stock.query.get(stock_id)
    if not stock:
        return {"error": "Stock not found"}, 404

    # Ensure the user has a portfolio
    portfolio = Portfolio.query.filter_by(user_id=current_user.id).first()
    if not portfolio:
        return {"error": "Portfolio not found"}, 404

    # Add or update the stock in the portfolio
    portfolio_stock = PortfolioStock.query.filter_by(portfolio_id=portfolio.id, stock_id=stock.id).first()
    if portfolio_stock:
        portfolio_stock.quantity += quantity
    else:
        portfolio_stock = PortfolioStock(portfolio_id=portfolio.id, stock_id=stock.id, quantity=quantity)
        db.session.add(portfolio_stock)

    db.session.commit()
    return {"message": "Stock added to portfolio"}


@stock_routes.route('/portfolio/<int:portfolio_id>/stocks/<int:stock_id>', methods=['PUT'])
def update_stock_quantity(portfolio_id, stock_id):
    data = request.get_json()
    new_quantity = data.get('quantity')

    holding = PortfolioStock.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()
    if not holding:
        return jsonify({'error': 'Holding not found'}), 404

    holding.quantity = new_quantity
    db.session.commit()
    return jsonify({'message': 'Stock quantity updated'})

@stock_routes.route('/portfolio/<int:portfolio_id>/stocks/<int:stock_id>', methods=['DELETE'])
def delete_stock_from_portfolio(portfolio_id, stock_id):
    holding = PortfolioStock.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()
    if not holding:
        return jsonify({'error': 'Holding not found'}), 404

    # Optionally refund user based on current price
    stock = Stock.query.get(stock_id)
    portfolio = Portfolio.query.get(portfolio_id)
    refund = stock.price * holding.quantity
    portfolio.balance += refund

    db.session.delete(holding)
    db.session.commit()
    return jsonify({'message': 'Stock removed from portfolio and refunded'})

@stock_routes.route('/portfolio/<string:symbol>', methods=['DELETE'])
@login_required
def remove_from_portfolio(symbol):
    stock = Portfolio.query.filter_by(user_id=current_user.id, symbol=symbol).first()
    if stock:
        db.session.delete(stock)
        db.session.commit()
        return {"message": f"Stock {symbol} removed from portfolio"}
    return {"error": "Stock not found in portfolio"}, 404
