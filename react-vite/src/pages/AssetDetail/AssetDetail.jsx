import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Navigate } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { thunkLoadAssets, thunkLoadQuotes, thunkLoadHistory } from "../../redux/market";
import { thunkAddToWatchlist, thunkRemoveFromWatchlist, thunkLoadWatchlist } from "../../redux/watchlist";
import { thunkLoadPortfolio } from "../../redux/portfolio";
import { csrfFetchJson } from "../../utils/csrfFetch";
import AssetIcon from "../../components/AssetIcon/AssetIcon";
import PriceChart from "../../components/PriceChart/PriceChart";
import RangeTabs from "../../components/RangeTabs/RangeTabs";
import TradePanel from "../../components/TradePanel/TradePanel";
import "./AssetDetail.css";

export default function AssetDetail() {
  const { symbol } = useParams();
  const dispatch = useDispatch();
  const assets = useSelector((state) => state.market.assets);
  const quote = useSelector((state) => state.market.quotes[symbol]);
  const sessionUser = useSelector((state) => state.session.user);
  const watchlistItems = useSelector((state) => state.watchlist.items);

  const [range, setRange] = useState("1M");
  const [chartType, setChartType] = useState("candles");
  const [recentTxns, setRecentTxns] = useState([]);

  const history = useSelector((state) => state.market.history[`${symbol}:${range}`]);

  useEffect(() => {
    dispatch(thunkLoadAssets());
    dispatch(thunkLoadQuotes([symbol]));
    if (sessionUser) {
      dispatch(thunkLoadWatchlist());
      dispatch(thunkLoadPortfolio());
    }
  }, [dispatch, symbol, sessionUser]);

  useEffect(() => {
    dispatch(thunkLoadHistory(symbol, range));
  }, [dispatch, symbol, range]);

  const loadRecentTxns = useCallback(() => {
    if (!sessionUser) return;
    csrfFetchJson(`/api/transactions/?symbol=${symbol}&per_page=5`).then((data) => setRecentTxns(data.transactions));
  }, [symbol, sessionUser]);

  useEffect(() => {
    loadRecentTxns();
  }, [loadRecentTxns]);

  const asset = assets.find((a) => a.symbol === symbol);
  if (assets.length && !asset) return <Navigate to="/404" replace />;

  const isWatched = watchlistItems.some((i) => i.symbol === symbol);
  const toggleWatchlist = () => {
    if (isWatched) dispatch(thunkRemoveFromWatchlist(symbol));
    else dispatch(thunkAddToWatchlist(symbol));
  };

  return (
    <div className="container">
      <div className="asset-header">
        <div className="asset-header-title">
          <AssetIcon symbol={symbol} size={36} />
          <div>
            <h1>{asset ? asset.name : symbol} <span className="asset-header-symbol">{symbol}</span></h1>
            {quote && (
              <p className="asset-header-price">
                <span className="num">${quote.price.toFixed(2)}</span>{" "}
                <span className={`num ${quote.changePercent >= 0 ? "pos" : "neg"}`}>
                  {quote.change >= 0 ? "+" : ""}
                  {quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                </span>
                {quote.source === "simulated" && <span className="badge" style={{ marginLeft: "var(--space-2)" }}>simulated</span>}
              </p>
            )}
          </div>
        </div>
        {sessionUser && (
          <button className="btn btn-ghost" onClick={toggleWatchlist}>
            {isWatched ? <FaStar color="#f0b90b" /> : <FaRegStar />} {isWatched ? "Watching" : "Watch"}
          </button>
        )}
      </div>

      <div className="asset-layout">
        <div>
          <div className="card">
            <div className="chart-card-header">
              <RangeTabs value={range} onChange={setRange} />
              <div className="chart-type-toggle">
                <button
                  type="button"
                  className={chartType === "candles" ? "active" : ""}
                  onClick={() => setChartType("candles")}
                >
                  Candles
                </button>
                <button type="button" className={chartType === "area" ? "active" : ""} onClick={() => setChartType("area")}>
                  Line
                </button>
              </div>
            </div>
            {history ? (
              <PriceChart candles={history.candles} type={chartType} height={360} />
            ) : (
              <div className="page-loading">Loading chart...</div>
            )}
          </div>

          {quote && (
            <div className="stat-grid" style={{ marginTop: "var(--space-4)" }}>
              <div className="stat-card">
                <div className="stat-label">Day High</div>
                <div className="stat-value num" style={{ fontSize: "1.1rem" }}>${quote.dayHigh.toFixed(2)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Day Low</div>
                <div className="stat-value num" style={{ fontSize: "1.1rem" }}>${quote.dayLow.toFixed(2)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Volume</div>
                <div className="stat-value num" style={{ fontSize: "1.1rem" }}>{quote.volume.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Prev Close</div>
                <div className="stat-value num" style={{ fontSize: "1.1rem" }}>${quote.prevClose.toFixed(2)}</div>
              </div>
            </div>
          )}

          {sessionUser && recentTxns.length > 0 && (
            <>
              <h2 className="section-title">Recent activity</h2>
              <div className="data-table-wrap card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Side</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTxns.map((t) => (
                      <tr key={t.id}>
                        <td>{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className={t.side === "buy" ? "pos" : "neg"}>{t.side}</td>
                        <td className="num">{t.quantity}</td>
                        <td className="num">${t.price.toFixed(2)}</td>
                        <td className="num">${t.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div>
          <TradePanel symbol={symbol} quote={quote} onOrderPlaced={loadRecentTxns} />
        </div>
      </div>
    </div>
  );
}
