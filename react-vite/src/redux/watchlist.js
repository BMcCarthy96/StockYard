import { csrfFetchJson } from "../utils/csrfFetch";
import { LOGOUT } from "./session";

const SET_ITEMS = "watchlist/setItems";
const ADD_ITEM = "watchlist/addItem";
const REMOVE_ITEM = "watchlist/removeItem";

const setItems = (items) => ({ type: SET_ITEMS, payload: items });
const addItem = (item) => ({ type: ADD_ITEM, payload: item });
const removeItem = (symbol) => ({ type: REMOVE_ITEM, payload: symbol });

export const thunkLoadWatchlist = () => async (dispatch) => {
  const data = await csrfFetchJson("/api/watchlist/");
  dispatch(setItems(data.items));
};

export const thunkAddToWatchlist = (symbol) => async (dispatch) => {
  try {
    const item = await csrfFetchJson("/api/watchlist/", { method: "POST", body: { symbol } });
    dispatch(addItem(item));
    return null;
  } catch (e) {
    return e.errors;
  }
};

export const thunkRemoveFromWatchlist = (symbol) => async (dispatch) => {
  await csrfFetchJson(`/api/watchlist/${symbol}`, { method: "DELETE" });
  dispatch(removeItem(symbol));
};

const initialState = { items: [] };

export default function watchlistReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ITEMS:
      return { ...state, items: action.payload };
    case ADD_ITEM:
      return { ...state, items: [...state.items, action.payload] };
    case REMOVE_ITEM:
      return { ...state, items: state.items.filter((i) => i.symbol !== action.payload) };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}
