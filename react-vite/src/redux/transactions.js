import { csrfFetchJson } from "../utils/csrfFetch";
import { LOGOUT } from "./session";

const SET_TRANSACTIONS = "transactions/setTransactions";

const setTransactions = (payload) => ({ type: SET_TRANSACTIONS, payload });

export const thunkLoadTransactions = (params = {}) => async (dispatch, getState) => {
  const filters = { ...getState().transactions.filters, ...params };
  const query = new URLSearchParams();
  if (filters.symbol) query.set("symbol", filters.symbol);
  if (filters.side) query.set("side", filters.side);
  query.set("page", filters.page || 1);
  query.set("per_page", filters.per_page || 20);

  const data = await csrfFetchJson(`/api/transactions/?${query.toString()}`);
  dispatch(setTransactions({ ...data, filters }));
};

const initialState = {
  items: [],
  page: 1,
  pages: 1,
  total: 0,
  filters: { symbol: "", side: "", page: 1, per_page: 20 },
};

export default function transactionsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_TRANSACTIONS:
      return {
        ...state,
        items: action.payload.transactions,
        page: action.payload.page,
        pages: action.payload.pages,
        total: action.payload.total,
        filters: action.payload.filters,
      };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}
