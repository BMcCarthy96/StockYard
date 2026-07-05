import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function Landing() {
  const sessionUser = useSelector((state) => state.session.user);
  if (sessionUser) return <Navigate to="/dashboard" replace />;

  return (
    <div className="container">
      <h1>Trading &amp; Investing</h1>
      <p>
        StockYard offers real-time data, powerful tools, and expert insights
        to help you make informed decisions. Start building your financial
        future today with StockYard.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        <Link to="/signup" className="btn btn-primary">
          Get started
        </Link>
        <Link to="/login" className="btn btn-ghost">
          Try the demo
        </Link>
      </div>
    </div>
  );
}
