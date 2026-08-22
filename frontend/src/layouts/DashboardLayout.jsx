import { Outlet, Link } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import LogoutIcon from "@mui/icons-material/Logout";

const buttonStyle = {
  padding: "0.5rem 1rem",
  background: "transparent",
  color: "black",
  border: "1px solid black",
  cursor: "pointer",
  fontSize: "0.9rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: 700,
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
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
          borderRight: "1px solid black",
          width: "210px",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column" }}
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
              fontSize: "13px",
              margin: "0 5px",
              wordWrap: "anywhere"
            }}
          >
            {user?.email}
          </span>

          <button onClick={logout} style={{...buttonStyle, borderTop: "1px solid black", borderRadius: 0}}>
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
