import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import Markets from "../pages/Markets/Markets";
import AssetDetail from "../pages/AssetDetail/AssetDetail";
import Portfolio from "../pages/Portfolio/Portfolio";
import Transactions from "../pages/Transactions/Transactions";
import NotFound from "../pages/NotFound/NotFound";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/markets", element: <Markets /> },
      { path: "/assets/:symbol", element: <AssetDetail /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/portfolio", element: <Portfolio /> },
          { path: "/transactions", element: <Transactions /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
