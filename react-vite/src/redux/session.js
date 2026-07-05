import { csrfFetchJson } from "../utils/csrfFetch";

const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";
const UPDATE_CASH_BALANCE = "session/updateCashBalance";

// Other slices holding user-specific data listen for this and reset.
export const LOGOUT = "session/LOGOUT";

const setUser = (user) => ({ type: SET_USER, payload: user });
const removeUser = () => ({ type: REMOVE_USER });
export const updateCashBalance = (cashBalance) => ({ type: UPDATE_CASH_BALANCE, payload: cashBalance });

export const thunkAuthenticate = () => async (dispatch) => {
  try {
    const user = await csrfFetchJson("/api/auth/");
    dispatch(setUser(user));
  } catch {
    dispatch(removeUser());
  }
};

export const thunkLogin = (credentials) => async (dispatch) => {
  try {
    const user = await csrfFetchJson("/api/auth/login", { method: "POST", body: credentials });
    dispatch(setUser(user));
    return null;
  } catch (e) {
    return e.errors;
  }
};

export const thunkSignup = (userData) => async (dispatch) => {
  try {
    const user = await csrfFetchJson("/api/auth/signup", { method: "POST", body: userData });
    dispatch(setUser(user));
    return null;
  } catch (e) {
    return e.errors;
  }
};

export const thunkLogout = () => async (dispatch) => {
  await csrfFetchJson("/api/auth/logout");
  dispatch(removeUser());
  dispatch({ type: LOGOUT });
};

const initialState = { user: null };

export default function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    case UPDATE_CASH_BALANCE:
      return state.user ? { ...state, user: { ...state.user, cash_balance: action.payload } } : state;
    default:
      return state;
  }
}
