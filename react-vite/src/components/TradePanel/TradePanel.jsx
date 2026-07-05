import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { thunkPlaceOrder } from "../../redux/portfolio";
import "./TradePanel.css";

export default function TradePanel({ symbol, quote, onOrderPlaced }) {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const holdings = useSelector((state) => state.portfolio.summary?.holdings || []);
  const holding = holdings.find((h) => h.symbol === symbol);

  const [side, setSide] = useState("buy");
  const [mode, setMode] = useState("quantity");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!sessionUser) {
    return (
      <div className="card trade-panel">
        <p>
          <Link to="/login">Log in</Link> to trade {symbol}.
        </p>
      </div>
    );
  }

  const price = quote?.price;
  const numericAmount = parseFloat(amount) || 0;
  const estimatedQuantity = mode === "notional" && price ? numericAmount / price : numericAmount;
  const estimatedTotal = mode === "quantity" && price ? numericAmount * price : numericAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!amount || numericAmount <= 0) {
      setError("Enter an amount greater than zero");
      return;
    }

    setSubmitting(true);
    const order = { symbol, side, ...(mode === "notional" ? { notional: numericAmount } : { quantity: numericAmount }) };
    const { result, errors } = await dispatch(thunkPlaceOrder(order));
    setSubmitting(false);

    if (errors) {
      setError(Object.values(errors)[0]);
    } else {
      setSuccess(
        `${side === "buy" ? "Bought" : "Sold"} ${result.transaction.quantity} ${symbol} at $${result.transaction.price.toFixed(2)}`
      );
      setAmount("");
      onOrderPlaced?.();
    }
  };

  return (
    <div className="card trade-panel">
      <div className="trade-side-toggle">
        <button
          type="button"
          className={`btn ${side === "buy" ? "btn-buy" : "btn-ghost"}`}
          onClick={() => setSide("buy")}
        >
          Buy
        </button>
        <button
          type="button"
          className={`btn ${side === "sell" ? "btn-sell" : "btn-ghost"}`}
          onClick={() => setSide("sell")}
        >
          Sell
        </button>
      </div>

      <div className="trade-meta">
        <span>Cash available</span>
        <span className="num">${sessionUser.cash_balance.toFixed(2)}</span>
      </div>
      <div className="trade-meta">
        <span>{symbol} held</span>
        <span className="num">{holding ? holding.quantity : 0}</span>
      </div>

      <form onSubmit={handleSubmit} className="trade-form">
        <div className="trade-mode-toggle">
          <button type="button" className={mode === "quantity" ? "active" : ""} onClick={() => setMode("quantity")}>
            Quantity
          </button>
          <button type="button" className={mode === "notional" ? "active" : ""} onClick={() => setMode("notional")}>
            Dollars
          </button>
        </div>
        <input
          className="input num"
          type="number"
          step="any"
          min="0"
          placeholder={mode === "quantity" ? "Quantity" : "Amount in $"}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {price && amount > 0 && (
          <p className="trade-preview num">
            {mode === "notional" ? `≈ ${estimatedQuantity.toFixed(6)} ${symbol}` : `≈ $${estimatedTotal.toFixed(2)} total`}
          </p>
        )}

        {error && <p className="error-text">{error}</p>}
        {success && <p className="pos">{success}</p>}

        <button
          type="submit"
          className={`btn ${side === "buy" ? "btn-buy" : "btn-sell"}`}
          disabled={submitting}
          style={{ width: "100%" }}
        >
          {submitting ? "Placing order..." : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
        </button>
      </form>
    </div>
  );
}
