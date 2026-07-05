import btc from "../../assets/crypto-icons/btc.svg";
import eth from "../../assets/crypto-icons/eth.svg";
import sol from "../../assets/crypto-icons/sol.svg";
import xrp from "../../assets/crypto-icons/xrp.svg";
import doge from "../../assets/crypto-icons/doge.svg";
import ada from "../../assets/crypto-icons/ada.svg";
import avax from "../../assets/crypto-icons/avax.svg";
import link from "../../assets/crypto-icons/link.svg";
import "./AssetIcon.css";

const CRYPTO_ICONS = {
  "BTC-USD": btc,
  "ETH-USD": eth,
  "SOL-USD": sol,
  "XRP-USD": xrp,
  "DOGE-USD": doge,
  "ADA-USD": ada,
  "AVAX-USD": avax,
  "LINK-USD": link,
};

// Deterministic accent color per stock symbol (no free stock-logo set exists,
// so unmatched symbols get a colored monogram badge instead).
const BADGE_COLORS = [
  "#F0B90B", "#0ECB81", "#3B82F6", "#A855F7",
  "#F6465D", "#14B8A6", "#F97316", "#6366F1",
];

function colorForSymbol(symbol) {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

export default function AssetIcon({ symbol, size = 28 }) {
  const iconSrc = CRYPTO_ICONS[symbol];

  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={symbol}
        width={size}
        height={size}
        className="asset-icon"
      />
    );
  }

  return (
    <div
      className="asset-icon asset-icon-badge"
      style={{
        width: size,
        height: size,
        backgroundColor: colorForSymbol(symbol),
        fontSize: size * 0.38,
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
