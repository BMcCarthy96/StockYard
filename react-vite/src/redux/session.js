const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";
const ADD_TO_WATCHLIST = "watchlist/addToWatchlist";
const REMOVE_FROM_WATCHLIST = "watchlist/removeFromWatchlist";
const ADD_TO_PORTFOLIO = "portfolio/addToPortfolio";

const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

const removeUser = () => ({
  type: REMOVE_USER,
});

const addToWatchlist = (stock) => ({
  type: ADD_TO_WATCHLIST,
  payload: stock,
});
const removeFromWatchlist = (stock) => ({
  type: REMOVE_FROM_WATCHLIST,
  payload: stock,
});

const addToPortfolio = (stock) => ({
  type: ADD_TO_PORTFOLIO,
  payload: stock,
});

export const thunkAuthenticate = () => async (dispatch) => {
  const response = await fetch("/api/auth/");
  if (response.ok) {
    const data = await response.json();
    if (data.errors) {
      return;
    }

    dispatch(setUser(data));
  }
};

export const thunkLogin = (credentials) => async (dispatch) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages;
  } else {
    return { server: "Something went wrong. Please try again" };
  }
};

export const thunkSignup = (user) => async (dispatch) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages;
  } else {
    return { server: "Something went wrong. Please try again" };
  }
};

export const thunkLogout = () => async (dispatch) => {
  await fetch("/api/auth/logout");
  dispatch(removeUser());
};

export const thunkAddToWatchlist = (stock) => async (dispatch) => {
  const response = await fetch("/api/stocks/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stock),
  });
  if (response.ok) {
    dispatch(addToWatchlist(stock));
  }
};

export const thunkRemoveFromWatchlist = (stockSymbol) => async (dispatch) => {
  const response = await fetch(`/api/stocks/watchlist/${stockSymbol}`, {
    method: "DELETE",
  });
  if (response.ok) {
    dispatch(removeFromWatchlist(stockSymbol));
  }
};

export const thunkAddToPortfolio = (stock) => async (dispatch) => {
  const response = await fetch("/api/stocks/portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stock),
  });
  if (response.ok) {
    dispatch(addToPortfolio(stock));
  }
};

const sessionInitialState = { user: null };
const watchlistInitialState = [];
const portfolioInitialState = [];

function sessionReducer(state = sessionInitialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
}

function watchlistReducer(state = watchlistInitialState, action) {
  switch (action.type) {
    case ADD_TO_WATCHLIST:
      return [...state, action.payload];
    case REMOVE_FROM_WATCHLIST:
      return state.filter((stock) => stock.symbol !== action.payload);
    default:
      return state;
  }
}

function portfolioReducer(state = portfolioInitialState, action) {
  switch (action.type) {
    case ADD_TO_PORTFOLIO:
      return [...state, action.payload];
    default:
      return state;
  }
}

export { sessionReducer, watchlistReducer, portfolioReducer };
