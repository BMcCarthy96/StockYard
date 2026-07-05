import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: "center", paddingTop: "3rem" }}>
      <h1>404</h1>
      <p>This page doesn&apos;t exist.</p>
      <Link to="/" className="btn btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
        Back home
      </Link>
    </div>
  );
}
