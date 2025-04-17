import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./Portfolio.css";

export default function Portfolio() {
  const user = useSelector((state) => state.session.user);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addCash, setAddCash] = useState("");

  useEffect(() => {
    if (user) {
      fetch(`/api/portfolio/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setPortfolio(data);
          setLoading(false);
        });
    }
  }, [user]);

  const handleAddFunds = async () => {
    const res = await fetch(`/api/portfolio/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ add_cash: parseFloat(addCash) }),
    });
    const data = await res.json();
    setPortfolio(data);
    setAddCash("");
  };

  const handleDelete = async () => {
    await fetch(`/api/portfolio/${user.id}`, { method: "DELETE" });
    setPortfolio(null);
  };

  if (!sessionUser) return <p>Please log in to view your portfolio.</p>;

  return (
    <div className="portfolio-container">
      <h1>{user.username}&#39;s Portfolio</h1>
      {portfolio ? (
        <>
          <div className="tab-switcher">
            <button
              className={tab === 'funds' ? 'active-tab' : ''}
              onClick={() => setTab('funds')}
            >
              Funds
            </button>
            <button
              className={tab === 'stocks' ? 'active-tab' : ''}
              onClick={() => setTab('stocks')}
            >
              Stocks
            </button>
          </div>

          <div className="portfolio-actions">
            <input
              type="number"
              placeholder="Add Funds"
              value={addCash}
              onChange={(e) => setAddCash(e.target.value)}
            />
            <button onClick={handleAddFunds}>Add Funds</button>
            <button className="danger" onClick={handleDelete}>
              Delete Portfolio
            </button>
          </div>
        </>
      ) : (
        <div className="no-portfolio">
          <p>You don’t have a portfolio yet.</p>
          <button
            onClick={async () => {
              const res = await fetch("/api/portfolio", { method: "POST" });
              const data = await res.json();
              setPortfolio(data);
            }}
          >
            Create Portfolio
          </button>
        </>
      )}
    </div>
  );
};
