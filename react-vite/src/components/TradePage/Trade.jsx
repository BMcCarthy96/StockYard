import React, { useState } from "react";
import "./Trade.css";

const stocks = [
  {
    no: 1,
    symbol: "AAPL",
    name: "Apple",
    movement: "Up",
    lastPrice: "$175.64",
    change: "+2.34",
    percentChange: "+1.35%",
    open: "$173.30",
    prevClose: "$173.30",
    high: "$176.00",
    low: "$172.50",
    volume: "54.3M",
    wk52High: "$182.94",
    wk52Low: "$124.17",
  },
  {
    no: 2,
    symbol: "GOOG",
    name: "Google",
    movement: "Down",
    lastPrice: "$135.12",
    change: "-1.23",
    percentChange: "-0.90%",
    open: "$136.50",
    prevClose: "$136.35",
    high: "$137.00",
    low: "$134.50",
    volume: "22.1M",
    wk52High: "$144.16",
    wk52Low: "$83.45",
  },
  {
    no: 3,
    symbol: "MSFT",
    name: "Microsoft",
    movement: "Up",
    lastPrice: "$320.45",
    change: "+3.12",
    percentChange: "+0.98%",
    open: "$317.00",
    prevClose: "$317.33",
    high: "$321.50",
    low: "$316.00",
    volume: "29.8M",
    wk52High: "$349.67",
    wk52Low: "$213.43",
  },
  {
    no: 4,
    symbol: "AMZN",
    name: "Amazon",
    movement: "Up",
    lastPrice: "$135.67",
    change: "+1.45",
    percentChange: "+1.08%",
    open: "$134.00",
    prevClose: "$134.22",
    high: "$136.50",
    low: "$133.50",
    volume: "41.2M",
    wk52High: "$146.57",
    wk52Low: "$81.43",
  },
  {
    no: 5,
    symbol: "NVDA",
    name: "Nvidia",
    movement: "Up",
    lastPrice: "$450.23",
    change: "+5.67",
    percentChange: "+1.28%",
    open: "$444.00",
    prevClose: "$444.56",
    high: "$452.00",
    low: "$442.00",
    volume: "32.5M",
    wk52High: "$480.88",
    wk52Low: "$108.13",
  },
  {
    no: 6,
    symbol: "TSLA",
    name: "Tesla",
    movement: "Down",
    lastPrice: "$245.12",
    change: "-3.45",
    percentChange: "-1.39%",
    open: "$248.00",
    prevClose: "$248.57",
    high: "$249.00",
    low: "$243.00",
    volume: "65.4M",
    wk52High: "$313.80",
    wk52Low: "$101.81",
  },
  {
    no: 7,
    symbol: "PLTR",
    name: "Palantir",
    movement: "Up",
    lastPrice: "$17.45",
    change: "+0.67",
    percentChange: "+4.00%",
    open: "$16.80",
    prevClose: "$16.78",
    high: "$17.60",
    low: "$16.50",
    volume: "18.7M",
    wk52High: "$20.24",
    wk52Low: "$5.84",
  },
];

function Trade() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedStock, setSelectedStock] = useState(stocks[0]); // Default to the first stock
  const [selectedSide, setSelectedSide] = useState("Buy");
  const [quantity, setQuantity] = useState(10);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="trade-page">
      <div className="trade-container">
        <table className="trade-table">
          <thead>
            <tr>
              <th className="sticky-column">No.</th>
              <th className="sticky-column">Symbol</th>
              <th className="sticky-column">Name</th>
              <th>Movement</th>
              <th>Last Price</th>
              <th>Change</th>
              <th>% Change</th>
              <th>Open</th>
              <th>Prev Close</th>
              <th>High</th>
              <th>Low</th>
              <th>Volume</th>
              <th>52wk High</th>
              <th>52wk Low</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.no} onClick={() => setSelectedStock(stock)}>
                <td className="sticky-column">{stock.no}</td>
                <td className="sticky-column">{stock.symbol}</td>
                <td className="sticky-column">{stock.name}</td>
                <td>{stock.movement}</td>
                <td>{stock.lastPrice}</td>
                <td>{stock.change}</td>
                <td>{stock.percentChange}</td>
                <td>{stock.open}</td>
                <td>{stock.prevClose}</td>
                <td>{stock.high}</td>
                <td>{stock.low}</td>
                <td>{stock.volume}</td>
                <td>{stock.wk52High}</td>
                <td>{stock.wk52Low}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={`sidebar ${isSidebarExpanded ? "expanded" : "collapsed"}`}
      >
        <div className="toggle-button" onClick={toggleSidebar}>
          {isSidebarExpanded ? "→" : "←"}
        </div>
        {isSidebarExpanded && (
          <div className="sidebar-content">
            {/* Quote Section */}
            <div className="quote-section">
              <h3>Quote</h3>
              <div className="quote-symbol">
                <strong>{selectedStock.symbol}</strong>{" "}
                <span>{selectedStock.name}</span>
              </div>
              <div className="quote-price">
                <span className="price">{selectedStock.lastPrice}</span>
                <div className="price-change">
                  <span
                    className={`change ${
                      selectedStock.change.startsWith("+")
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {selectedStock.change}
                  </span>
                  <span
                    className={`percent-change ${
                      selectedStock.percentChange.startsWith("+")
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {selectedStock.percentChange}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Statistics Section */}
            <div className="key-statistics-section">
              <h3>Key Statistics</h3>
              <div className="statistics-grid">
                <div>Open</div>
                <div>{selectedStock.open}</div>
                <div>High</div>
                <div>{selectedStock.high}</div>
                <div>52 Wk High</div>
                <div>{selectedStock.wk52High}</div>
                <div>Prev Close</div>
                <div>{selectedStock.prevClose}</div>
                <div>Low</div>
                <div>{selectedStock.low}</div>
                <div>52 Wk Low</div>
                <div>{selectedStock.wk52Low}</div>
              </div>
            </div>

            {/* Classic Trade Section */}
            <div className="classic-trade-section">
              <h3>Classic Trade</h3>
              <div className="side-bar">
                <div
                  className={`side-option ${
                    selectedSide === "Buy" ? "active" : ""
                  }`}
                  onClick={() => setSelectedSide("Buy")}
                >
                  Buy
                </div>
                <div
                  className={`side-option ${
                    selectedSide === "Sell" ? "active" : ""
                  }`}
                  onClick={() => setSelectedSide("Sell")}
                >
                  Sell
                </div>
              </div>

              <div className="order-type">
                <label>Order Type</label>
                <select>
                  <option>MARKET</option>
                  <option>LIMIT</option>
                </select>
              </div>

              <div className="quantity-selector">
                <label>Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
              </div>

              <div className="time-in-force">
                <label>Time-in-Force</label>
                <select>
                  <option>Day</option>
                  <option>GTC</option>
                </select>
              </div>

              <div>
                <label>
                  <input type="checkbox" />
                  Stop-Loss Order
                </label>
                <br />
                <label>
                  <input type="checkbox" />
                  Take-Profit Order
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Trade;
