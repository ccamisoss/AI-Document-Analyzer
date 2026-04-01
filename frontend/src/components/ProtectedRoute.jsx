import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession";

export default function ProtectedRoute({ children }) {
  const { ready, isAuthenticated } = useSession();
  const location = useLocation();

  if (!ready) {
    return (
      <div style={{ color: "white", padding: "2rem", textAlign: "center" }}>
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}
