import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const { user: sessionUser, loaded } = useSelector((state) => state.session);
  const location = useLocation();

  if (!loaded) {
    return <div className="page-loading">Checking your session...</div>;
  }

  if (!sessionUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
