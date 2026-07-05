import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadAssets, thunkLoadQuotes } from "../../redux/market";
import AssetIcon from "../AssetIcon/AssetIcon";
import "./TickerTape.css";

export default function TickerTape() {
  const dispatch = useDispatch();
  const assets = useSelector((state) => state.market.assets);
  const quotes = useSelector((state) => state.market.quotes);

  useEffect(() => {
    dispatch(thunkLoadAssets());
  }, [dispatch]);

  useEffect(() => {
    if (assets.length) dispatch(thunkLoadQuotes());
  }, [dispatch, assets.length]);

  const items = assets.map((a) => ({ ...a, quote: quotes[a.symbol] })).filter((a) => a.quote);
  if (!items.length) return <div className="ticker-tape" />;

  const marqueeItems = [...items, ...items];

  return (
    <div className="ticker-tape">
      <div className="ticker-track">
        {marqueeItems.map((item, i) => (
          <div className="ticker-item" key={`${item.symbol}-${i}`}>
            <AssetIcon symbol={item.symbol} size={18} />
            <span className="ticker-symbol">{item.symbol}</span>
            <span className="num">${item.quote.price.toFixed(2)}</span>
            <span className={`num ${item.quote.changePercent >= 0 ? "pos" : "neg"}`}>
              {item.quote.changePercent >= 0 ? "+" : ""}
              {item.quote.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
