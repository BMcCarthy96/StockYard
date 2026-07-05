import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { thunkLoadTransactions } from "../../redux/transactions";

export default function Transactions() {
  const dispatch = useDispatch();
  const { items, page, pages, filters } = useSelector((state) => state.transactions);

  const [symbol, setSymbol] = useState(filters.symbol);
  const [side, setSide] = useState(filters.side);

  useEffect(() => {
    dispatch(thunkLoadTransactions());
  }, [dispatch]);

  const applyFilters = (e) => {
    e.preventDefault();
    dispatch(thunkLoadTransactions({ symbol, side, page: 1 }));
  };

  const goToPage = (newPage) => {
    dispatch(thunkLoadTransactions({ page: newPage }));
  };

  return (
    <div className="container">
      <h1>Transactions</h1>

      <form onSubmit={applyFilters} style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        <input
          className="input"
          style={{ maxWidth: "160px" }}
          placeholder="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        />
        <select className="input" style={{ maxWidth: "140px" }} value={side} onChange={(e) => setSide(e.target.value)}>
          <option value="">All sides</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <button type="submit" className="btn btn-primary">Filter</button>
      </form>

      {items.length === 0 ? (
        <p className="empty-state">No transactions match your filters.</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td><Link to={`/assets/${t.symbol}`}>{t.symbol}</Link></td>
                  <td className={t.side === "buy" ? "pos" : "neg"}>{t.side}</td>
                  <td>{t.quantity}</td>
                  <td>${t.price.toFixed(2)}</td>
                  <td>${t.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button className="btn btn-ghost" disabled={page >= pages} onClick={() => goToPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
