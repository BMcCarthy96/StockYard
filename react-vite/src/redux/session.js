const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";
const ADD_TO_WATCHLIST = "session/addToWatchlist";
const REMOVE_FROM_WATCHLIST = "session/removeFromWatchlist";
const ADD_TO_PORTFOLIO = "session/addToPortfolio";
const REMOVE_FROM_PORTFOLIO = "session/removeFromPortfolio";
const ADD_TO_WATCHLIST = "session/addToWatchlist";
const REMOVE_FROM_WATCHLIST = "session/removeFromWatchlist";
const ADD_TO_PORTFOLIO = "session/addToPortfolio";
const REMOVE_FROM_PORTFOLIO = "session/removeFromPortfolio";

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

const removeFromPortfolio = (stockSymbol) => ({
    type: REMOVE_FROM_PORTFOLIO,
    payload: stockSymbol,
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

export const thunkAddToWatchlist = (stock) => async (dispatch, getState) => {
    const { user } = getState().session;
    if (!user) return;

    const response = await fetch("/api/stocks/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stock),
    });
    if (response.ok) {
        dispatch(addToWatchlist(stock));
    }
};

export const thunkRemoveFromWatchlist =
    (stockSymbol) => async (dispatch, getState) => {
        const { user } = getState().session;
        if (!user) return;

        const response = await fetch(`/api/stocks/watchlist/${stockSymbol}`, {
            method: "DELETE",
        });
        if (response.ok) {
            dispatch(removeFromWatchlist(stockSymbol));
        }
    };

export const thunkAddToPortfolio = (stock) => async (dispatch, getState) => {
    const { user } = getState().session;
    if (!user) return;

    const response = await fetch("/api/stocks/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stock),
    });
    if (response.ok) {
        dispatch(addToPortfolio(stock));
    }
};

export const thunkRemoveFromPortfolio =
    (stockSymbol) => async (dispatch, getState) => {
        const { user } = getState().session;
        if (!user) return;

        const response = await fetch(`/api/stocks/portfolio/${stockSymbol}`, {
            method: "DELETE",
        });
        if (response.ok) {
            dispatch(removeFromPortfolio(stockSymbol));
        }
    };

const sessionInitialState = { user: null, watchlist: [], portfolio: [] };
const sessionInitialState = { user: null, watchlist: [], portfolio: [] };

function sessionReducer(state = sessionInitialState, action) {
    switch (action.type) {
        case SET_USER:
            return { ...state, user: action.payload };
        case REMOVE_USER:
            return { ...state, user: null, watchlist: [], portfolio: [] };
        case ADD_TO_WATCHLIST:
            return {
                ...state,
                watchlist: [...state.watchlist, action.payload],
            };
        case REMOVE_FROM_WATCHLIST:
            return {
                ...state,
                watchlist: state.watchlist.filter(
                    (stock) => stock.symbol !== action.payload
                ),
            };
        case ADD_TO_PORTFOLIO:
            return {
                ...state,
                portfolio: [...state.portfolio, action.payload],
            };
        case REMOVE_FROM_PORTFOLIO:
            return {
                ...state,
                portfolio: state.portfolio.filter(
                    (stock) => stock.symbol !== action.payload
                ),
            };
        default:
            return state;
    }
}

export { sessionReducer };
export { sessionReducer };
