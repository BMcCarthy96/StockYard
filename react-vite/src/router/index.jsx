import { createBrowserRouter } from "react-router-dom";
import Trade from "../components/TradePage/Trade";
import Watchlist from "../components/WatchlistPage/Watchlist";
import Portfolio from "../components/PortfolioPage/Portfolio";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import Layout from "./Layout";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <h1>Trading & Investing</h1>,
            <p>
              StockYard offers real-time data, powerful tools, and expert
              <br />
              insights to help you make informed decisions. Start building your
              <br />
              financial future today with StockYard.
            </p>
          </>
        ),
      },
      { path: "/trade", element: <Trade /> },
      { path: "/watchlist", element: <Watchlist /> },
      { path: "/portfolio", element: <Portfolio /> },
      {
        path: "login",
        element: <LoginFormPage />,
      },
      {
        path: "signup",
        element: <SignupFormPage />,
      },
    ],
  },
]);
