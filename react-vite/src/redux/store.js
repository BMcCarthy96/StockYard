import {
    legacy_createStore as createStore,
    applyMiddleware,
    compose,
    combineReducers,
} from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./session";
import marketReducer from "./market";
import portfolioReducer from "./portfolio";
import watchlistReducer from "./watchlist";
import transactionsReducer from "./transactions";

const rootReducer = combineReducers({
    session: sessionReducer,
    market: marketReducer,
    portfolio: portfolioReducer,
    watchlist: watchlistReducer,
    transactions: transactionsReducer,
});

let enhancer;
if (import.meta.env.MODE === "production") {
    enhancer = applyMiddleware(thunk);
} else {
    const logger = (await import("redux-logger")).default;
    const composeEnhancers =
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
    return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
