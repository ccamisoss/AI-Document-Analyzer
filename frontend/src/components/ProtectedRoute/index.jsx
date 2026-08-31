import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import Loader from "../Loader";

export default function ProtectedRoute({ children }) {
  const { ready, isAuthenticated } = useSession();
  const location = useLocation();

  if (!ready) {
    return (
      <Loader />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}
