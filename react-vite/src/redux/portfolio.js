import { csrfFetchJson } from "../utils/csrfFetch";
import { LOGOUT, updateCashBalance } from "./session";

const SET_SUMMARY = "portfolio/setSummary";
const SET_HISTORY = "portfolio/setHistory";

const setSummary = (summary) => ({ type: SET_SUMMARY, payload: summary });
const setHistory = (range, data) => ({ type: SET_HISTORY, payload: { range, data } });

export const thunkLoadPortfolio = () => async (dispatch) => {
  const data = await csrfFetchJson("/api/portfolio/");
  dispatch(setSummary(data));
  return data;
};

export const thunkLoadPortfolioHistory = (range) => async (dispatch) => {
  const data = await csrfFetchJson(`/api/portfolio/history?range=${range}`);
  dispatch(setHistory(range, data));
  return data;
};

// Places an order, then refreshes the session's cash balance and the
// portfolio summary. Callers that also show transactions/watchlist should
// separately dispatch thunkLoadTransactions()/thunkLoadWatchlist().
export const thunkPlaceOrder = (order) => async (dispatch) => {
  try {
    const result = await csrfFetchJson("/api/orders/", { method: "POST", body: order });
    dispatch(updateCashBalance(result.cash_balance));
    await dispatch(thunkLoadPortfolio());
    return { result, errors: null };
  } catch (e) {
    return { result: null, errors: e.errors };
  }
};

const initialState = { summary: null, history: {} };

export default function portfolioReducer(state = initialState, action) {
  switch (action.type) {
    case SET_SUMMARY:
      return { ...state, summary: action.payload };
    case SET_HISTORY:
      return { ...state, history: { ...state.history, [action.payload.range]: action.payload.data } };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}
