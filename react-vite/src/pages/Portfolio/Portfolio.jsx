import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { thunkLoadPortfolio } from "../../redux/portfolio";

export default function Portfolio() {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.portfolio.summary);

  useEffect(() => {
    dispatch(thunkLoadPortfolio());
  }, [dispatch]);

  if (!summary) return <div className="page-loading">Loading portfolio...</div>;

  return (
    <div className="container">
      <h1>Portfolio</h1>

      <div style={{ display: "flex", gap: "1rem", margin: "1rem 0", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: "200px" }}>
          <div>Total Value</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>${summary.total_value.toFixed(2)}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "200px" }}>
          <div>Cash</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>${summary.cash_balance.toFixed(2)}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "200px" }}>
          <div>Market Value</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>${summary.total_market_value.toFixed(2)}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "200px" }}>
          <div>Total P/L</div>
          <div className={summary.total_unrealized_pl >= 0 ? "pos" : "neg"} style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            ${summary.total_unrealized_pl.toFixed(2)} ({summary.total_unrealized_pl_percent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {summary.holdings.length === 0 ? (
        <p className="empty-state">No holdings yet. <Link to="/markets">Browse markets</Link> to place your first trade.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Avg Cost</th>
              <th>Price</th>
              <th>Market Value</th>
              <th>P/L</th>
              <th>Day %</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {summary.holdings.map((h) => (
              <tr key={h.symbol}>
                <td><Link to={`/assets/${h.symbol}`}>{h.symbol}</Link></td>
                <td>{h.quantity}</td>
                <td>${h.avg_cost.toFixed(2)}</td>
                <td>${h.current_price.toFixed(2)}</td>
                <td>${h.market_value.toFixed(2)}</td>
                <td className={h.unrealized_pl >= 0 ? "pos" : "neg"}>
                  ${h.unrealized_pl.toFixed(2)} ({h.unrealized_pl_percent.toFixed(2)}%)
                </td>
                <td className={h.day_change_percent >= 0 ? "pos" : "neg"}>{h.day_change_percent.toFixed(2)}%</td>
                <td><Link to={`/assets/${h.symbol}`} className="btn btn-ghost">Trade</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
