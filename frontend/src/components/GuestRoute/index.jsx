import { Navigate } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import Loader from "../Loader";

export default function GuestRoute({ children }) {
  const { ready, isAuthenticated } = useSession();

  if (!ready) {
    return (
      <Loader />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
