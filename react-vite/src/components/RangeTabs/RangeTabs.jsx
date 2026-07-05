import "./RangeTabs.css";

const RANGES = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

export default function RangeTabs({ value, onChange }) {
  return (
    <div className="range-tabs">
      {RANGES.map((r) => (
        <button
          key={r}
          className={`range-tab ${value === r ? "active" : ""}`}
          onClick={() => onChange(r)}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
