import { csrfFetchJson } from "../utils/csrfFetch";

const SET_ASSETS = "market/setAssets";
const SET_QUOTES = "market/setQuotes";
const SET_HISTORY = "market/setHistory";

const setAssets = (assets) => ({ type: SET_ASSETS, payload: assets });
const setQuotes = (payload) => ({ type: SET_QUOTES, payload });
const setHistory = (key, data) => ({ type: SET_HISTORY, payload: { key, data } });

export const thunkLoadAssets = () => async (dispatch, getState) => {
  if (getState().market.assets.length) return;
  const data = await csrfFetchJson("/api/market/assets");
  dispatch(setAssets(data.assets));
};

export const thunkLoadQuotes = (symbols) => async (dispatch) => {
  const query = symbols && symbols.length ? `?symbols=${symbols.join(",")}` : "";
  const data = await csrfFetchJson(`/api/market/quotes${query}`);
  dispatch(setQuotes(data));
  return data;
};

export const thunkLoadHistory = (symbol, range) => async (dispatch, getState) => {
  const key = `${symbol}:${range}`;
  const cached = getState().market.history[key];
  if (cached) return cached;
  const data = await csrfFetchJson(`/api/market/history/${symbol}?range=${range}`);
  dispatch(setHistory(key, data));
  return data;
};

const initialState = { assets: [], quotes: {}, quotesAsOf: null, history: {} };

// Market data is public/shared, not user-specific, so it intentionally
// survives session/LOGOUT (unlike portfolio/watchlist/transactions).
export default function marketReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ASSETS:
      return { ...state, assets: action.payload };
    case SET_QUOTES:
      return {
        ...state,
        quotes: { ...state.quotes, ...action.payload.quotes },
        quotesAsOf: action.payload.asOf,
      };
    case SET_HISTORY:
      return { ...state, history: { ...state.history, [action.payload.key]: action.payload.data } };
    default:
      return state;
  }
}
