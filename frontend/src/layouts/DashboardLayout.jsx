import { Outlet, Link } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import LogoutIcon from "@mui/icons-material/Logout";

const buttonStyle = {
  padding: "0.5rem 1rem",
  background: "#f1f5f9",
  color: "#1a202c",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
  fontSize: "0.875rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

function DashboardLayout() {
  const { user, logout } = useSession();

  return (
    <div className="app-container">
      <div
        style={{
          backgroundColor: "white",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}
        >
          <Link to={"/"} style={buttonStyle}>
            Dashboard
          </Link>
          <Link to={"/analyze"} style={buttonStyle}>
            Analyze
          </Link>
        </div>

        <div
          style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}
        >
          <span
            style={{
              color: "#4a5568",
              fontSize: "0.875rem",
              paddingInline: "8px",
            }}
          >
            {user?.email}
          </span>

          <button onClick={logout} style={buttonStyle}>
            <LogoutIcon />
            Logout
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
