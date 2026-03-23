import { Outlet, Link, useNavigate } from "react-router-dom";
import authService from "../services/auth.service";

function DashboardLayout({ setIsAuthenticated, setUser, user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="app-container">
      <div
        style={{
          backgroundColor: "white",
          padding: "1rem",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#4a5568" }}>{user?.email}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            to={"/"}
            style={{
              padding: "0.5rem 1rem",
              background: "#f1f5f9",
              color: "#1a202c",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Dashboard
          </Link>
          <Link
            to={"/analyze"}
            style={{
              padding: "0.5rem 1rem",
              background: "#f1f5f9",
              color: "#1a202c",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Analyze
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              background: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
