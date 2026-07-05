import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { thunkLoadPortfolio, thunkLoadPortfolioHistory } from "../../redux/portfolio";
import { thunkLoadWatchlist } from "../../redux/watchlist";
import { thunkLoadQuotes, thunkLoadAssets } from "../../redux/market";
import EquityChart from "../../components/PriceChart/EquityChart";
import RangeTabs from "../../components/RangeTabs/RangeTabs";
import AssetIcon from "../../components/AssetIcon/AssetIcon";
import "./Dashboard.css";

export default function Dashboard() {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.portfolio.summary);
  const historyByRange = useSelector((state) => state.portfolio.history);
  const watchlistItems = useSelector((state) => state.watchlist.items);
  const assets = useSelector((state) => state.market.assets);
  const quotes = useSelector((state) => state.market.quotes);
  const [range, setRange] = useState("1M");

  useEffect(() => {
    dispatch(thunkLoadPortfolio());
    dispatch(thunkLoadWatchlist());
    dispatch(thunkLoadAssets());
  }, [dispatch]);

  useEffect(() => {
    dispatch(thunkLoadPortfolioHistory(range));
  }, [dispatch, range]);

  useEffect(() => {
    if (assets.length) dispatch(thunkLoadQuotes());
  }, [dispatch, assets.length]);

  if (!summary) return <div className="page-loading">Loading dashboard...</div>;

  const history = historyByRange[range];
  const movers = [...assets]
    .map((a) => ({ ...a, quote: quotes[a.symbol] }))
    .filter((a) => a.quote)
    .sort((a, b) => Math.abs(b.quote.changePercent) - Math.abs(a.quote.changePercent))
    .slice(0, 5);

  return (
    <div className="container">
      <h1>Dashboard</h1>

      <div className="stat-grid" style={{ marginTop: "var(--space-4)" }}>
        <div className="stat-card">
          <div className="stat-label">Total Value</div>
          <div className="stat-value num">${summary.total_value.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cash Balance</div>
          <div className="stat-value num">${summary.cash_balance.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total P/L</div>
          <div className={`stat-value num ${summary.total_unrealized_pl >= 0 ? "pos" : "neg"}`}>
            {summary.total_unrealized_pl >= 0 ? "+" : ""}
            ${summary.total_unrealized_pl.toFixed(2)} ({summary.total_unrealized_pl_percent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="card dashboard-chart-card">
        <div className="chart-card-header">
          <h3>Portfolio value</h3>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        {history ? <EquityChart points={history.points} height={280} /> : <div className="page-loading">Loading chart...</div>}
      </div>

      <div className="dashboard-columns">
        <div>
          <h2 className="section-title">Holdings</h2>
          {summary.holdings.length === 0 ? (
            <p className="empty-state">
              No holdings yet. <Link to="/markets">Browse markets</Link> to place your first trade.
            </p>
          ) : (
            <div className="data-table-wrap card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Market Value</th>
                    <th>P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.holdings.slice(0, 5).map((h) => (
                    <tr key={h.symbol}>
                      <td>
                        <Link to={`/assets/${h.symbol}`} className="asset-cell">
                          <AssetIcon symbol={h.symbol} size={22} />
                          <span>{h.symbol}</span>
                        </Link>
                      </td>
                      <td className="num">{h.quantity}</td>
                      <td className="num">${h.current_price.toFixed(2)}</td>
                      <td className="num">${h.market_value.toFixed(2)}</td>
                      <td className={`num ${h.unrealized_pl >= 0 ? "pos" : "neg"}`}>
                        ${h.unrealized_pl.toFixed(2)} ({h.unrealized_pl_percent.toFixed(2)}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {summary.holdings.length > 5 && (
            <p style={{ marginTop: "var(--space-2)" }}>
              <Link to="/portfolio">View full portfolio &rarr;</Link>
            </p>
          )}
        </div>

        <div>
          <h2 className="section-title">Watchlist</h2>
          {watchlistItems.length === 0 ? (
            <p className="empty-state">Your watchlist is empty.</p>
          ) : (
            <div className="data-table-wrap card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Price</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistItems.map((item) => {
                    const quote = quotes[item.symbol];
                    return (
                      <tr key={item.symbol}>
                        <td>
                          <Link to={`/assets/${item.symbol}`} className="asset-cell">
                            <AssetIcon symbol={item.symbol} size={22} />
                            <span>{item.symbol}</span>
                          </Link>
                        </td>
                        <td className="num">{quote ? `$${quote.price.toFixed(2)}` : "..."}</td>
                        <td className={`num ${quote && quote.changePercent >= 0 ? "pos" : "neg"}`}>
                          {quote ? `${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%` : "..."}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <h2 className="section-title">Movers</h2>
          <div className="data-table-wrap card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {movers.map((m) => (
                  <tr key={m.symbol}>
                    <td>
                      <Link to={`/assets/${m.symbol}`} className="asset-cell">
                        <AssetIcon symbol={m.symbol} size={22} />
                        <span>{m.symbol}</span>
                      </Link>
                    </td>
                    <td className={`num ${m.quote.changePercent >= 0 ? "pos" : "neg"}`}>
                      {m.quote.changePercent >= 0 ? "+" : ""}
                      {m.quote.changePercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
