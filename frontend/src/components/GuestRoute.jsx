import { Navigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";

export default function GuestRoute({ children }) {
  const { ready, isAuthenticated } = useSession();

  if (!ready) {
    return (
      <div style={{ color: "white", padding: "2rem", textAlign: "center" }}>
        Loading…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
