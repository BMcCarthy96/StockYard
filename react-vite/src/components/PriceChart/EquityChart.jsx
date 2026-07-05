import PriceChart from "./PriceChart";

// Reuses PriceChart in area mode, colored green/red by whether the range
// ended up or down (distinct from the accent-gold area used for the
// per-asset "line view" toggle).
export default function EquityChart({ points, height = 300 }) {
  if (!points || points.length === 0) return null;

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const color = last >= first ? "#0ECB81" : "#F6465D";

  const candles = points.map((p) => ({ t: p.t, o: p.value, h: p.value, l: p.value, c: p.value }));

  return <PriceChart candles={candles} type="area" height={height} areaColor={color} />;
}
