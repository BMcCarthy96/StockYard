import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { thunkLoadPortfolio } from "../../redux/portfolio";
import { thunkLoadWatchlist } from "../../redux/watchlist";
import { thunkLoadQuotes } from "../../redux/market";

export default function Dashboard() {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.portfolio.summary);
  const watchlistItems = useSelector((state) => state.watchlist.items);
  const quotes = useSelector((state) => state.market.quotes);

  useEffect(() => {
    dispatch(thunkLoadPortfolio());
    dispatch(thunkLoadWatchlist());
  }, [dispatch]);

  useEffect(() => {
    if (watchlistItems.length) {
      dispatch(thunkLoadQuotes(watchlistItems.map((i) => i.symbol)));
    }
  }, [dispatch, watchlistItems]);

  if (!summary) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="container">
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: "200px" }}>
          <div>Total Value</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>${summary.total_value.toFixed(2)}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "200px" }}>
          <div>Cash Balance</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>${summary.cash_balance.toFixed(2)}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "200px" }}>
          <div>Total P/L</div>
          <div className={summary.total_unrealized_pl >= 0 ? "pos" : "neg"} style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            ${summary.total_unrealized_pl.toFixed(2)} ({summary.total_unrealized_pl_percent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Holdings</h2>
      {summary.holdings.length === 0 ? (
        <p className="empty-state">No holdings yet. <Link to="/markets">Browse markets</Link> to place your first trade.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Market Value</th>
              <th>P/L</th>
            </tr>
          </thead>
          <tbody>
            {summary.holdings.slice(0, 5).map((h) => (
              <tr key={h.symbol}>
                <td><Link to={`/assets/${h.symbol}`}>{h.symbol}</Link></td>
                <td>{h.quantity}</td>
                <td>${h.current_price.toFixed(2)}</td>
                <td>${h.market_value.toFixed(2)}</td>
                <td className={h.unrealized_pl >= 0 ? "pos" : "neg"}>
                  ${h.unrealized_pl.toFixed(2)} ({h.unrealized_pl_percent.toFixed(2)}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {summary.holdings.length > 5 && <Link to="/portfolio">View full portfolio &rarr;</Link>}

      <h2 style={{ marginTop: "2rem" }}>Watchlist</h2>
      {watchlistItems.length === 0 ? (
        <p className="empty-state">Your watchlist is empty.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {watchlistItems.map((item) => {
              const quote = quotes[item.symbol];
              return (
                <tr key={item.symbol}>
                  <td><Link to={`/assets/${item.symbol}`}>{item.symbol}</Link></td>
                  <td>{quote ? `$${quote.price.toFixed(2)}` : "..."}</td>
                  <td className={quote && quote.changePercent >= 0 ? "pos" : "neg"}>
                    {quote ? `${quote.changePercent.toFixed(2)}%` : "..."}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
