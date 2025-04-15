const SET_STOCKS = "stocks/setStocks";

const setStocks = (stocks) => ({
    type: SET_STOCKS,
    payload: stocks,
});

export const fetchStocks = () => async (dispatch) => {
    const response = await fetch("/api/stocks");
    if (response.ok) {
        const data = await response.json();
        dispatch(setStocks(data));
    }
};

const initialState = [];

export default function stocksReducer(state = initialState, action) {
    switch (action.type) {
        case SET_STOCKS:
            return action.payload;
        default:
            return state;
    }
}
