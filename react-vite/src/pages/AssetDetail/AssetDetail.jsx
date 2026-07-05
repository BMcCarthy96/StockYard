import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, Navigate } from "react-router-dom";
import { thunkLoadAssets, thunkLoadQuotes } from "../../redux/market";
import { thunkPlaceOrder } from "../../redux/portfolio";
import { thunkAddToWatchlist, thunkRemoveFromWatchlist, thunkLoadWatchlist } from "../../redux/watchlist";
import { thunkLoadTransactions } from "../../redux/transactions";

export default function AssetDetail() {
  const { symbol } = useParams();
  const dispatch = useDispatch();
  const assets = useSelector((state) => state.market.assets);
  const quote = useSelector((state) => state.market.quotes[symbol]);
  const sessionUser = useSelector((state) => state.session.user);
  const watchlistItems = useSelector((state) => state.watchlist.items);

  const [side, setSide] = useState("buy");
  const [quantity, setQuantity] = useState("");
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(thunkLoadAssets());
    dispatch(thunkLoadQuotes([symbol]));
    if (sessionUser) dispatch(thunkLoadWatchlist());
  }, [dispatch, symbol, sessionUser]);

  const asset = assets.find((a) => a.symbol === symbol);
  if (assets.length && !asset) return <Navigate to="/404" replace />;

  const isWatched = watchlistItems.some((i) => i.symbol === symbol);

  const toggleWatchlist = () => {
    if (isWatched) dispatch(thunkRemoveFromWatchlist(symbol));
    else dispatch(thunkAddToWatchlist(symbol));
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setOrderError(null);
    setOrderSuccess(null);
    setSubmitting(true);
    const { result, errors } = await dispatch(thunkPlaceOrder({ symbol, side, quantity: parseFloat(quantity) }));
    setSubmitting(false);
    if (errors) {
      setOrderError(Object.values(errors)[0]);
    } else {
      setOrderSuccess(`${side === "buy" ? "Bought" : "Sold"} ${result.transaction.quantity} ${symbol}`);
      setQuantity("");
      dispatch(thunkLoadTransactions());
    }
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>{asset ? asset.name : symbol} ({symbol})</h1>
          {quote && (
            <p>
              <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>${quote.price.toFixed(2)}</span>{" "}
              <span className={quote.changePercent >= 0 ? "pos" : "neg"}>
                {quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
              </span>
              {quote.source === "simulated" && <span style={{ marginLeft: "0.5rem", color: "#6b7280" }}>(simulated)</span>}
            </p>
          )}
        </div>
        {sessionUser && (
          <button className="btn btn-ghost" onClick={toggleWatchlist}>
            {isWatched ? "★ Watching" : "☆ Watch"}
          </button>
        )}
      </div>

      {quote && (
        <div style={{ display: "flex", gap: "1rem", margin: "1rem 0", flexWrap: "wrap" }}>
          <div className="card" style={{ flex: 1, minWidth: "150px" }}>Day High<br /><strong>${quote.dayHigh.toFixed(2)}</strong></div>
          <div className="card" style={{ flex: 1, minWidth: "150px" }}>Day Low<br /><strong>${quote.dayLow.toFixed(2)}</strong></div>
          <div className="card" style={{ flex: 1, minWidth: "150px" }}>Volume<br /><strong>{quote.volume.toLocaleString()}</strong></div>
          <div className="card" style={{ flex: 1, minWidth: "150px" }}>Prev Close<br /><strong>${quote.prevClose.toFixed(2)}</strong></div>
        </div>
      )}

      {sessionUser ? (
        <div className="card" style={{ maxWidth: "360px", marginTop: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <button className={side === "buy" ? "btn btn-buy" : "btn btn-ghost"} onClick={() => setSide("buy")} style={{ flex: 1 }}>Buy</button>
            <button className={side === "sell" ? "btn btn-sell" : "btn btn-ghost"} onClick={() => setSide("sell")} style={{ flex: 1 }}>Sell</button>
          </div>
          <form onSubmit={handleOrder} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                className="input"
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            {quote && quantity && (
              <p>Estimated total: ${(parseFloat(quantity || 0) * quote.price).toFixed(2)}</p>
            )}
            {orderError && <p className="error-text">{orderError}</p>}
            {orderSuccess && <p className="pos">{orderSuccess}</p>}
            <button type="submit" className={side === "buy" ? "btn btn-buy" : "btn btn-sell"} disabled={submitting}>
              {side === "buy" ? "Buy" : "Sell"} {symbol}
            </button>
          </form>
        </div>
      ) : (
        <p style={{ marginTop: "1.5rem" }}><Link to="/login">Log in</Link> to trade {symbol}.</p>
      )}
    </div>
  );
}
