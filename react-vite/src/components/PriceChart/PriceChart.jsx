import { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import "./PriceChart.css";

export default function PriceChart({ candles, type = "candles", height = 360, areaColor = "#F0B90B" }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Chart + series are recreated whenever the visual type or area color
  // changes; chart.remove() cleanup is mandatory here since React 18
  // StrictMode double-mounts effects in dev.
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "#8A94A6",
        fontFamily: "'Inter Variable', sans-serif",
      },
      grid: {
        vertLines: { color: "#1E2530" },
        horzLines: { color: "#1E2530" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#2A313C" },
      timeScale: { borderColor: "#2A313C", timeVisible: true, secondsVisible: false },
    });
    chartRef.current = chart;

    const series = type === "candles"
      ? chart.addCandlestickSeries({
          upColor: "#0ECB81",
          downColor: "#F6465D",
          borderVisible: false,
          wickUpColor: "#0ECB81",
          wickDownColor: "#F6465D",
        })
      : chart.addAreaSeries({
          lineColor: areaColor,
          topColor: `${areaColor}59`,
          bottomColor: `${areaColor}05`,
          lineWidth: 2,
        });
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [type, height, areaColor]);

  useEffect(() => {
    if (!seriesRef.current || !candles || candles.length === 0) return;
    const formatted = type === "candles"
      ? candles.map((c) => ({ time: c.t, open: c.o, high: c.h, low: c.l, close: c.c }))
      : candles.map((c) => ({ time: c.t, value: c.c }));
    seriesRef.current.setData(formatted);
    chartRef.current?.timeScale().fitContent();
  }, [candles, type]);

  return <div ref={containerRef} className="price-chart" />;
}
