import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaBolt, FaChartLine, FaShieldHalved, FaCoins } from "react-icons/fa6";
import { thunkLogin } from "../../redux/session";
import TickerTape from "../../components/TickerTape/TickerTape";
import AssetIcon from "../../components/AssetIcon/AssetIcon";
import "./Landing.css";

const FEATURES = [
  {
    icon: FaChartLine,
    title: "Real market data",
    body: "Live prices and historical charts for 20 stocks and 8 major cryptocurrencies.",
  },
  {
    icon: FaBolt,
    title: "Instant execution",
    body: "Buy and sell by quantity or dollar amount, priced against the latest quote.",
  },
  {
    icon: FaCoins,
    title: "$100,000 in play money",
    body: "Every account starts with a full paper-trading balance — no real money, no risk.",
  },
  {
    icon: FaShieldHalved,
    title: "Always available",
    body: "A deterministic simulated market keeps the app fully working even if live data is down.",
  },
];

export default function Landing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user);
  const assets = useSelector((state) => state.market.assets);
  const quotes = useSelector((state) => state.market.quotes);
  const [demoLoading, setDemoLoading] = useState(false);

  if (sessionUser) return <Navigate to="/dashboard" replace />;

  const handleTryDemo = async () => {
    setDemoLoading(true);
    const errors = await dispatch(thunkLogin({ email: "demo@aa.io", password: "password" }));
    setDemoLoading(false);
    if (!errors) navigate("/dashboard");
  };

  const movers = [...assets]
    .map((a) => ({ ...a, quote: quotes[a.symbol] }))
    .filter((a) => a.quote)
    .sort((a, b) => Math.abs(b.quote.changePercent) - Math.abs(a.quote.changePercent))
    .slice(0, 8);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <h1>Trading &amp; investing, without the risk</h1>
          <p className="hero-sub">
            StockYard is a full paper-trading platform with real-time market data, live
            candlestick charts, and a $100,000 starting balance. Build your portfolio,
            track performance, and learn the markets — no real money involved.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">
              Get started
            </Link>
            <button className="btn btn-ghost" onClick={handleTryDemo} disabled={demoLoading}>
              {demoLoading ? "Logging in..." : "Try the demo"}
            </button>
          </div>
        </div>
      </section>

      <TickerTape />

      <section className="container">
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card card" key={f.title}>
              <f.icon size={22} color="#f0b90b" />
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {movers.length > 0 && (
        <section className="container">
          <h2 className="section-title">Today&apos;s movers</h2>
          <div className="data-table-wrap card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Price</th>
                  <th>24h %</th>
                </tr>
              </thead>
              <tbody>
                {movers.map((m) => (
                  <tr key={m.symbol}>
                    <td>
                      <Link to={`/assets/${m.symbol}`} className="asset-cell">
                        <AssetIcon symbol={m.symbol} size={22} />
                        <span>{m.symbol}</span>
                        <span className="asset-name">{m.name}</span>
                      </Link>
                    </td>
                    <td className="num">${m.quote.price.toFixed(2)}</td>
                    <td className={`num ${m.quote.changePercent >= 0 ? "pos" : "neg"}`}>
                      {m.quote.changePercent >= 0 ? "+" : ""}
                      {m.quote.changePercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="container footer-inner">
          <span>StockYard — a mock trading platform for demo purposes only.</span>
          <span>Not real money. Not investment advice.</span>
        </div>
      </footer>
    </div>
  );
}
