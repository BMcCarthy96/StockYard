from flask import Blueprint, jsonify, request
from flask_login import login_required
from app.models import User, Portfolio, Stock, Watchlist, Transaction
from app import db

user_routes = Blueprint('users', __name__)


@user_routes.route('/')
@login_required
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    all_users = User.query.all()
    return {'users': [user.to_dict() for user in all_users]}


@user_routes.route('/<int:id>')
@login_required
def user(user_id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    result = User.query.get(user_id)
    return result.to_dict()

# Portfolio
@user_routes.route('/portfolio/<int:user_id>', methods=['GET'])
def get_portfolio(user_id):
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return jsonify({"error": "Portfolio not found"}), 404

    return jsonify(portfolio.to_dict())


@user_routes.route('/portfolio', methods=['POST'])
def create_portfolio():
    data = request.get_json()
    user_id = data.get('user_id')
    balance = data.get('balance', 0)

    portfolio = Portfolio(user_id=user_id, balance=balance)
    db.session.add(portfolio)
    db.session.commit()
    return jsonify(portfolio.to_dict()), 201


@user_routes.route('/portfolio/<int:portfolio_id>', methods=['PUT'])
def update_portfolio(portfolio_id):
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    data = request.get_json()
    amount = data.get('amount', 0)
    portfolio.balance += amount

    db.session.commit()
    return jsonify(portfolio.to_dict())


@user_routes.route('/portfolio/<int:portfolio_id>', methods=['DELETE'])
def delete_portfolio(portfolio_id):
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    db.session.delete(portfolio)
    db.session.commit()
    return jsonify({'message': 'Portfolio deleted successfully'})



# Stock Details
@user_routes.route('/stocks/<string:symbol>', methods=['GET'])
def get_stock_details(symbol):
    stock = Stock.query.filter_by(symbol=symbol.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404

    return jsonify(stock.to_dict())


@user_routes.route('/portfolio/<int:portfolio_id>/stocks', methods=['POST'])
def purchase_stock(portfolio_id):
    data = request.get_json()
    symbol = data.get('symbol')
    quantity = data.get('quantity')

    stock = Stock.query.filter_by(symbol=symbol.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404

    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    # Cost calc (assuming you have price in stock)
    total_price = stock.price * quantity
    if portfolio.balance < total_price:
        return jsonify({'error': 'Insufficient funds'}), 400

    # Deduct balance and add stock
    portfolio.balance -= total_price

    # Add or update PortfolioStock
    existing = PortfolioStock.query.filter_by(portfolio_id=portfolio_id, stock_id=stock.id).first()
    if existing:
        existing.quantity += quantity
    else:
        new_holding = PortfolioStock(portfolio_id=portfolio_id, stock_id=stock.id, quantity=quantity)
        db.session.add(new_holding)

    db.session.commit()
    return jsonify({'message': 'Stock purchased successfully'})


@user_routes.route('/portfolio/<int:portfolio_id>/stocks/<int:stock_id>', methods=['PUT'])
def update_stock_quantity(portfolio_id, stock_id):
    data = request.get_json()
    new_quantity = data.get('quantity')

    holding = PortfolioStock.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()
    if not holding:
        return jsonify({'error': 'Holding not found'}), 404

    holding.quantity = new_quantity
    db.session.commit()
    return jsonify({'message': 'Stock quantity updated'})


@user_routes.route('/portfolio/<int:portfolio_id>/stocks/<int:stock_id>', methods=['DELETE'])
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


# Watchlist
@user_routes.route('/watchlist/<int:user_id>', methods=['GET'])
def get_watchlist(user_id):
    # TODO: Return all stocks in user's watchlist
    return jsonify({'message': f'Watchlist for user {user_id}'})

@user_routes.route('/watchlist', methods=['POST'])
def add_to_watchlist():
    # TODO: Add stock to watchlist
    data = request.json
    return jsonify({'message': 'Adding to watchlist', 'data': data})

@user_routes.route('/watchlist/<int:watch_id>', methods=['DELETE'])
def remove_from_watchlist(watch_id):
    # TODO: Remove stock from watchlist
    return jsonify({'message': f'Removing watchlist item {watch_id}'})


# Search
@user_routes.route('/stocks/search', methods=['GET'])
def search_stocks():
    # Example: /stocks/search?query=AAPL
    query = request.args.get('query')
    # TODO: Return search results matching query
    return jsonify({'message': f'Searching for {query}'})

# Bonus: Transactions
@user_routes.route('/transactions/<int:user_id>', methods=['GET'])
def get_transaction_history(user_id):
    # TODO: Return user's transaction history
    return jsonify({'message': f'Transaction history for user {user_id}'})

@user_routes.route('/transactions/order', methods=['POST'])
def order_stock():
    # TODO: Create a recurring stock order
    data = request.json
    return jsonify({'message': 'Placing stock order', 'data': data})

@user_routes.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def cancel_transaction(transaction_id):
    # TODO: Cancel a specific transaction
    return jsonify({'message': f'Cancelling transaction {transaction_id}'})
