import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPortfolioThunk, createPortfolioThunk, updatePortfolioThunk, deletePortfolioThunk } from '../../redux/portfolio';
import './Portfolio.css';


export default function Portfolio() {
  const user = useSelector(state => state.session.user);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addCash, setAddCash] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`/api/portfolio/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setPortfolio(data);
          setLoading(false);
        });
    }
  }, [user]);

  const handleAddFunds = async () => {
    const res = await fetch(`/api/portfolio/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ add_cash: parseFloat(addCash) }),
    });
    const data = await res.json();
    setPortfolio(data);
    setAddCash('');
  };

  const handleDelete = async () => {
    await fetch(`/api/portfolio/${user.id}`, { method: 'DELETE' });
    setPortfolio(null);
  };

  if (!user) return <h2>Please log in to view your portfolio.</h2>;
  if (loading) return <h2>Loading portfolio...</h2>;

  return (
    <div className="portfolio-container">
      <h1>{user.username}'s Portfolio</h1>
      {portfolio ? (
        <>
          <div className="portfolio-card">
            <h2>Cash Balance</h2>
            <p className="balance">${portfolio.cash_balance.toFixed(2)}</p>
          </div>

          <div className="portfolio-actions">
            <input
              type="number"
              placeholder="Add Funds"
              value={addCash}
              onChange={(e) => setAddCash(e.target.value)}
            />
            <button onClick={handleAddFunds}>Add Funds</button>
            <button className="danger" onClick={handleDelete}>Delete Portfolio</button>
          </div>
        </>
      ) : (
        <>
          <p>You don’t have a portfolio yet.</p>
          <button
            onClick={async () => {
              const res = await fetch('/api/portfolio', { method: 'POST' });
              const data = await res.json();
              setPortfolio(data);
            }}
          >Create Portfolio</button>
        </>
      )}
    </div>
  );
}
