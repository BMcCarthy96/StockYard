import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { thunkLoadAssets, thunkLoadQuotes } from "../../redux/market";
import { thunkLoadWatchlist, thunkAddToWatchlist, thunkRemoveFromWatchlist } from "../../redux/watchlist";

export default function Markets() {
  const dispatch = useDispatch();
  const assets = useSelector((state) => state.market.assets);
  const quotes = useSelector((state) => state.market.quotes);
  const watchlistItems = useSelector((state) => state.watchlist.items);
  const sessionUser = useSelector((state) => state.session.user);

  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(thunkLoadAssets());
    if (sessionUser) dispatch(thunkLoadWatchlist());
  }, [dispatch, sessionUser]);

  useEffect(() => {
    if (assets.length) dispatch(thunkLoadQuotes());
  }, [dispatch, assets.length]);

  useEffect(() => {
    if (!assets.length) return;
    const interval = setInterval(() => dispatch(thunkLoadQuotes()), 60000);
    return () => clearInterval(interval);
  }, [dispatch, assets.length]);

  const watchlistSymbols = useMemo(() => new Set(watchlistItems.map((i) => i.symbol)), [watchlistItems]);

  const filtered = assets.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (search && !a.symbol.toLowerCase().includes(search.toLowerCase()) && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleWatchlist = (symbol) => {
    if (!sessionUser) return;
    if (watchlistSymbols.has(symbol)) {
      dispatch(thunkRemoveFromWatchlist(symbol));
    } else {
      dispatch(thunkAddToWatchlist(symbol));
    }
  };

  return (
    <div className="container">
      <h1>Markets</h1>

      <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        <button className={typeFilter === "all" ? "btn btn-primary" : "btn btn-ghost"} onClick={() => setTypeFilter("all")}>All</button>
        <button className={typeFilter === "stock" ? "btn btn-primary" : "btn btn-ghost"} onClick={() => setTypeFilter("stock")}>Stocks</button>
        <button className={typeFilter === "crypto" ? "btn btn-primary" : "btn btn-ghost"} onClick={() => setTypeFilter("crypto")}>Crypto</button>
        <input
          className="input"
          style={{ maxWidth: "240px" }}
          placeholder="Search symbol or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            {sessionUser && <th></th>}
            <th>Symbol</th>
            <th>Name</th>
            <th>Price</th>
            <th>24h %</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((asset) => {
            const quote = quotes[asset.symbol];
            return (
              <tr key={asset.symbol}>
                {sessionUser && (
                  <td>
                    <button className="btn btn-ghost" onClick={() => toggleWatchlist(asset.symbol)}>
                      {watchlistSymbols.has(asset.symbol) ? "★" : "☆"}
                    </button>
                  </td>
                )}
                <td><Link to={`/assets/${asset.symbol}`}>{asset.symbol}</Link></td>
                <td>{asset.name}</td>
                <td>{quote ? `$${quote.price.toFixed(2)}` : "..."}</td>
                <td className={quote && quote.changePercent >= 0 ? "pos" : "neg"}>
                  {quote ? `${quote.changePercent.toFixed(2)}%` : "..."}
                </td>
                <td>{quote ? quote.volume.toLocaleString() : "..."}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
