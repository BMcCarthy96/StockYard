import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPortfolioThunk,createPortfolioThunk,updatePortfolioThunk,deletePortfolioThunk,} from '../../redux/portfolio';
import './Portfolio.css';

const Portfolio = () => {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const portfolio = useSelector((state) => state.portfolio[sessionUser?.id]);

  const [tab, setTab] = useState('funds');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (sessionUser) {
      dispatch(getPortfolioThunk(sessionUser.id));
    }
  }, [dispatch, sessionUser]);

  const handleCreate = () => {
    dispatch(createPortfolioThunk({ user_id: sessionUser.id, balance: 0 }));
  };

  const handleAddFunds = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    dispatch(updatePortfolioThunk(sessionUser.id, { amount: parseFloat(amount) }));
    setAmount('');
  };

  const handleDelete = () => {
    dispatch(deletePortfolioThunk(sessionUser.id));
  };

  if (!sessionUser) return <p>Please log in to view your portfolio.</p>;

  return (
    <div className="portfolio-container">
      <h1>{`${sessionUser.username}'s Portfolio`}</h1>

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

          {tab === 'funds' && (
            <div className="funds-tab">
              <h2>Available Cash: ${portfolio.balance.toFixed(2)}</h2>
              <form onSubmit={handleAddFunds}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Add funds..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button type="submit">Add Funds</button>
              </form>
              <button className="delete-btn" onClick={handleDelete}>
                Delete Portfolio
              </button>
            </div>
          )}

          {tab === 'stocks' && (
            <div className="stocks-tab">
              <h2>Stock Holdings (Mock)</h2>
              <table className="stocks-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th>Shares</th>
                    <th>Price</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>AAPL</td>
                    <td>Apple Inc.</td>
                    <td>10</td>
                    <td>$175.00</td>
                    <td>$1,750.00</td>
                  </tr>
                  <tr>
                    <td>TSLA</td>
                    <td>Tesla Inc.</td>
                    <td>5</td>
                    <td>$240.00</td>
                    <td>$1,200.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="no-portfolio">
          <p>You don’t have a portfolio yet.</p>
          <button onClick={handleCreate}>Create Portfolio</button>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
