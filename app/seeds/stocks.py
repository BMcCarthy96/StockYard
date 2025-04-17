from app.models import db, Stock

def seed_stocks():
    stock1 = Stock(ticker="AAPL", name="Apple Inc.", price=190.42, exchange="NASDAQ", sector="Technology")
    stock2 = Stock(ticker="GOOGL", name="Alphabet Inc.", price=155.37, exchange="NASDAQ", sector="Technology")
    db.session.add_all([stock1, stock2])
    db.session.commit()

def undo_stocks():
    db.session.execute("DELETE FROM stocks")
    db.session.commit()
