from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import db, Portfolio

portfolio_routes = Blueprint('portfolio', __name__)

@portfolio_routes.route('/<int:user_id>', methods=['GET'])
@login_required
def get_portfolio(user_id):
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if portfolio:
        return portfolio.to_dict()
    return {"message": "Portfolio not found."}, 404


@portfolio_routes.route('/', methods=['POST'])
@login_required
def create_portfolio():
    new_portfolio = Portfolio(user_id=current_user.id, balance=0.0)
    db.session.add(new_portfolio)
    db.session.commit()
    return new_portfolio.to_dict(), 201


@portfolio_routes.route('/<int:user_id>', methods=['PUT'])
@login_required
def update_portfolio(user_id):
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return {"message": "Portfolio not found."}, 404

    data = request.get_json()
    add_cash = data.get('add_cash', 0.0)
    portfolio.cash_balance += float(add_cash)
    db.session.commit()
    return portfolio.to_dict()

@portfolio_routes.route('/<int:user_id>', methods=['DELETE'])
@login_required
def delete_portfolio(user_id):
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return {"message": "Portfolio not found."}, 404

    db.session.delete(portfolio)
    db.session.commit()
    return {"message": "Portfolio deleted successfully."}
