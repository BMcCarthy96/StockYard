import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { thunkLoadAssets, thunkLoadQuotes } from "../../redux/market";
import { thunkLoadWatchlist, thunkAddToWatchlist, thunkRemoveFromWatchlist } from "../../redux/watchlist";
import AssetIcon from "../../components/AssetIcon/AssetIcon";
import "./Markets.css";

const SORTERS = {
  name: (a, b) => a.name.localeCompare(b.name),
  price: (a, b) => (b.quote?.price || 0) - (a.quote?.price || 0),
  change: (a, b) => (b.quote?.changePercent || 0) - (a.quote?.changePercent || 0),
  volume: (a, b) => (b.quote?.volume || 0) - (a.quote?.volume || 0),
};

export default function Markets() {
  const dispatch = useDispatch();
  const assets = useSelector((state) => state.market.assets);
  const quotes = useSelector((state) => state.market.quotes);
  const watchlistItems = useSelector((state) => state.watchlist.items);
  const sessionUser = useSelector((state) => state.session.user);

  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("change");

  useEffect(() => {
    dispatch(thunkLoadAssets());
    if (sessionUser) dispatch(thunkLoadWatchlist());
  }, [dispatch, sessionUser]);

  useEffect(() => {
    if (assets.length) dispatch(thunkLoadQuotes());
  }, [dispatch, assets.length]);

  useEffect(() => {
    if (!assets.length) return undefined;
    const interval = setInterval(() => dispatch(thunkLoadQuotes()), 60000);
    return () => clearInterval(interval);
  }, [dispatch, assets.length]);

  const watchlistSymbols = useMemo(() => new Set(watchlistItems.map((i) => i.symbol)), [watchlistItems]);

  const rows = assets
    .filter((a) => (typeFilter === "all" ? true : a.type === typeFilter))
    .filter((a) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    })
    .map((a) => ({ ...a, quote: quotes[a.symbol] }))
    .sort(SORTERS[sortKey]);

  const toggleWatchlist = (symbol) => {
    if (!sessionUser) return;
    if (watchlistSymbols.has(symbol)) dispatch(thunkRemoveFromWatchlist(symbol));
    else dispatch(thunkAddToWatchlist(symbol));
  };

  return (
    <div className="container">
      <h1>Markets</h1>

      <div className="markets-toolbar">
        <div className="markets-tabs">
          <button className={`btn btn-ghost ${typeFilter === "all" ? "active" : ""}`} onClick={() => setTypeFilter("all")}>
            All
          </button>
          <button className={`btn btn-ghost ${typeFilter === "stock" ? "active" : ""}`} onClick={() => setTypeFilter("stock")}>
            Stocks
          </button>
          <button className={`btn btn-ghost ${typeFilter === "crypto" ? "active" : ""}`} onClick={() => setTypeFilter("crypto")}>
            Crypto
          </button>
        </div>
        <input
          className="input markets-search"
          placeholder="Search symbol or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="data-table-wrap card">
        <table className="data-table">
          <thead>
            <tr>
              {sessionUser && <th></th>}
              <th onClick={() => setSortKey("name")} className="sortable">Asset</th>
              <th onClick={() => setSortKey("price")} className="sortable">Price</th>
              <th onClick={() => setSortKey("change")} className="sortable">24h %</th>
              <th onClick={() => setSortKey("volume")} className="sortable">Volume</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((asset) => (
              <tr key={asset.symbol}>
                {sessionUser && (
                  <td>
                    <button className="watch-star" onClick={() => toggleWatchlist(asset.symbol)}>
                      {watchlistSymbols.has(asset.symbol) ? (
                        <FaStar color="#f0b90b" />
                      ) : (
                        <FaRegStar color="var(--text-muted)" />
                      )}
                    </button>
                  </td>
                )}
                <td>
                  <Link to={`/assets/${asset.symbol}`} className="asset-cell">
                    <AssetIcon symbol={asset.symbol} size={26} />
                    <span>{asset.symbol}</span>
                    <span className="asset-name">{asset.name}</span>
                  </Link>
                </td>
                <td className="num">{asset.quote ? `$${asset.quote.price.toFixed(2)}` : "..."}</td>
                <td className={`num ${asset.quote && asset.quote.changePercent >= 0 ? "pos" : "neg"}`}>
                  {asset.quote ? `${asset.quote.changePercent >= 0 ? "+" : ""}${asset.quote.changePercent.toFixed(2)}%` : "..."}
                </td>
                <td className="num">{asset.quote ? asset.quote.volume.toLocaleString() : "..."}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
