from flask import Blueprint, request

from app.assets import all_assets, is_valid_symbol
from app.services.market_data import get_quotes, get_history

market_routes = Blueprint('market', __name__)

# Market data is public (no @login_required): the landing page's ticker tape
# and the Markets table both need to work for logged-out visitors.


@market_routes.route('/assets', methods=['GET'])
def assets():
    """Returns the curated symbol registry."""
    return {"assets": [
        {"symbol": a["symbol"], "name": a["name"], "type": a["type"], "sector": a["sector"]}
        for a in all_assets()
    ]}


@market_routes.route('/quotes', methods=['GET'])
def quotes():
    """Returns cached quotes for the requested symbols (default: all)."""
    raw = request.args.get('symbols')
    symbols = [s.strip() for s in raw.split(',') if s.strip()] if raw else None
    return get_quotes(symbols)


@market_routes.route('/history/<string:symbol>', methods=['GET'])
def history(symbol):
    """Returns OHLCV candles for a symbol over a given range."""
    if not is_valid_symbol(symbol):
        return {"errors": {"symbol": "Unknown symbol"}}, 404
    range_key = request.args.get('range', '1M')
    return get_history(symbol, range_key)


@market_routes.route('/search', methods=['GET'])
def search():
    """Substring search over the registry by symbol or name."""
    q = request.args.get('q', '').strip().lower()
    if not q:
        return {"assets": []}
    matches = [
        {"symbol": a["symbol"], "name": a["name"], "type": a["type"], "sector": a["sector"]}
        for a in all_assets()
        if q in a["symbol"].lower() or q in a["name"].lower()
    ]
    return {"assets": matches}
