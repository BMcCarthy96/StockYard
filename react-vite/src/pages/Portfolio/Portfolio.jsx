import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { thunkLoadPortfolio } from "../../redux/portfolio";
import AssetIcon from "../../components/AssetIcon/AssetIcon";
import "./Portfolio.css";

const ALLOCATION_COLORS = ["#F0B90B", "#0ECB81", "#3B82F6", "#A855F7", "#F6465D", "#14B8A6", "#F97316", "#6366F1"];

export default function Portfolio() {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.portfolio.summary);

  useEffect(() => {
    dispatch(thunkLoadPortfolio());
  }, [dispatch]);

  if (!summary) return <div className="page-loading">Loading portfolio...</div>;

  const allocation = [
    { label: "Cash", value: summary.cash_balance, color: "#5E6673" },
    ...summary.holdings.map((h, i) => ({
      label: h.symbol,
      value: h.market_value,
      color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
    })),
  ].filter((a) => a.value > 0);

  return (
    <div className="container">
      <h1>Portfolio</h1>

      <div className="stat-grid" style={{ marginTop: "var(--space-4)" }}>
        <div className="stat-card">
          <div className="stat-label">Total Value</div>
          <div className="stat-value num">${summary.total_value.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cash</div>
          <div className="stat-value num">${summary.cash_balance.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Market Value</div>
          <div className="stat-value num">${summary.total_market_value.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total P/L</div>
          <div className={`stat-value num ${summary.total_unrealized_pl >= 0 ? "pos" : "neg"}`}>
            {summary.total_unrealized_pl >= 0 ? "+" : ""}
            ${summary.total_unrealized_pl.toFixed(2)} ({summary.total_unrealized_pl_percent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {allocation.length > 0 && (
        <div className="card allocation-card">
          <h3>Allocation</h3>
          <div className="allocation-bar">
            {allocation.map((a) => (
              <div
                key={a.label}
                className="allocation-segment"
                style={{ width: `${(a.value / summary.total_value) * 100}%`, background: a.color }}
                title={`${a.label}: $${a.value.toFixed(2)}`}
              />
            ))}
          </div>
          <div className="allocation-legend">
            {allocation.map((a) => (
              <div className="allocation-legend-item" key={a.label}>
                <span className="allocation-dot" style={{ background: a.color }} />
                {a.label} ({((a.value / summary.total_value) * 100).toFixed(1)}%)
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <td>
                    <Link to={`/assets/${h.symbol}`} className="asset-cell">
                      <AssetIcon symbol={h.symbol} size={26} />
                      <span>{h.symbol}</span>
                    </Link>
                  </td>
                  <td className="num">{h.quantity}</td>
                  <td className="num">${h.avg_cost.toFixed(2)}</td>
                  <td className="num">${h.current_price.toFixed(2)}</td>
                  <td className="num">${h.market_value.toFixed(2)}</td>
                  <td className={`num ${h.unrealized_pl >= 0 ? "pos" : "neg"}`}>
                    ${h.unrealized_pl.toFixed(2)} ({h.unrealized_pl_percent.toFixed(2)}%)
                  </td>
                  <td className={`num ${h.day_change_percent >= 0 ? "pos" : "neg"}`}>{h.day_change_percent.toFixed(2)}%</td>
                  <td>
                    <Link to={`/assets/${h.symbol}`} className="btn btn-ghost">
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
