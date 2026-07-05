import { Link } from "react-router-dom";
import { FaChartLine } from "react-icons/fa6";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="container not-found">
      <FaChartLine size={40} color="#f0b90b" />
      <h1>404</h1>
      <p>This page doesn&apos;t exist.</p>
      <Link to="/" className="btn btn-primary">
        Back home
      </Link>
    </div>
  );
}
