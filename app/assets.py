"""
Curated registry of tradable symbols. This app does not use a database table
for assets — the registry is the single source of truth for which symbols
exist, their display metadata, and the parameters used to generate a
deterministic simulated price series when live market data is unavailable.
"""

REGISTRY = {
    "AAPL": {"name": "Apple Inc.", "type": "stock", "sector": "Technology", "base_price": 195.00, "volatility": 0.015},
    "MSFT": {"name": "Microsoft Corporation", "type": "stock", "sector": "Technology", "base_price": 440.00, "volatility": 0.016},
    "GOOGL": {"name": "Alphabet Inc.", "type": "stock", "sector": "Communication Services", "base_price": 180.00, "volatility": 0.017},
    "AMZN": {"name": "Amazon.com Inc.", "type": "stock", "sector": "Consumer Discretionary", "base_price": 210.00, "volatility": 0.019},
    "NVDA": {"name": "NVIDIA Corporation", "type": "stock", "sector": "Technology", "base_price": 135.00, "volatility": 0.028},
    "META": {"name": "Meta Platforms Inc.", "type": "stock", "sector": "Communication Services", "base_price": 545.00, "volatility": 0.025},
    "TSLA": {"name": "Tesla Inc.", "type": "stock", "sector": "Consumer Discretionary", "base_price": 245.00, "volatility": 0.032},
    "AMD": {"name": "Advanced Micro Devices Inc.", "type": "stock", "sector": "Technology", "base_price": 185.00, "volatility": 0.026},
    "NFLX": {"name": "Netflix Inc.", "type": "stock", "sector": "Communication Services", "base_price": 285.00, "volatility": 0.024},
    "DIS": {"name": "The Walt Disney Company", "type": "stock", "sector": "Communication Services", "base_price": 95.00, "volatility": 0.020},
    "JPM": {"name": "JPMorgan Chase & Co.", "type": "stock", "sector": "Financials", "base_price": 220.00, "volatility": 0.018},
    "V": {"name": "Visa Inc.", "type": "stock", "sector": "Financials", "base_price": 310.00, "volatility": 0.014},
    "WMT": {"name": "Walmart Inc.", "type": "stock", "sector": "Consumer Staples", "base_price": 95.00, "volatility": 0.012},
    "KO": {"name": "The Coca-Cola Company", "type": "stock", "sector": "Consumer Staples", "base_price": 67.00, "volatility": 0.013},
    "PEP": {"name": "PepsiCo Inc.", "type": "stock", "sector": "Consumer Staples", "base_price": 92.00, "volatility": 0.012},
    "XOM": {"name": "ExxonMobil Corporation", "type": "stock", "sector": "Energy", "base_price": 115.00, "volatility": 0.021},
    "BA": {"name": "The Boeing Company", "type": "stock", "sector": "Industrials", "base_price": 205.00, "volatility": 0.027},
    "INTC": {"name": "Intel Corporation", "type": "stock", "sector": "Technology", "base_price": 42.00, "volatility": 0.025},
    "CRM": {"name": "Salesforce Inc.", "type": "stock", "sector": "Technology", "base_price": 330.00, "volatility": 0.023},
    "UBER": {"name": "Uber Technologies Inc.", "type": "stock", "sector": "Consumer Discretionary", "base_price": 78.00, "volatility": 0.029},
    "BTC-USD": {"name": "Bitcoin", "type": "crypto", "sector": "Crypto", "base_price": 68500.00, "volatility": 0.048},
    "ETH-USD": {"name": "Ethereum", "type": "crypto", "sector": "Crypto", "base_price": 3800.00, "volatility": 0.052},
    "SOL-USD": {"name": "Solana", "type": "crypto", "sector": "Crypto", "base_price": 158.00, "volatility": 0.058},
    "XRP-USD": {"name": "XRP", "type": "crypto", "sector": "Crypto", "base_price": 2.45, "volatility": 0.055},
    "DOGE-USD": {"name": "Dogecoin", "type": "crypto", "sector": "Crypto", "base_price": 0.32, "volatility": 0.062},
    "ADA-USD": {"name": "Cardano", "type": "crypto", "sector": "Crypto", "base_price": 0.98, "volatility": 0.059},
    "AVAX-USD": {"name": "Avalanche", "type": "crypto", "sector": "Crypto", "base_price": 42.00, "volatility": 0.061},
    "LINK-USD": {"name": "Chainlink", "type": "crypto", "sector": "Crypto", "base_price": 28.50, "volatility": 0.057},
}


def is_valid_symbol(symbol):
    return symbol in REGISTRY


def get_asset(symbol):
    asset = REGISTRY.get(symbol)
    if asset is None:
        return None
    return {"symbol": symbol, **asset}


def all_assets():
    return [{"symbol": symbol, **data} for symbol, data in REGISTRY.items()]


def all_symbols():
    return list(REGISTRY.keys())
