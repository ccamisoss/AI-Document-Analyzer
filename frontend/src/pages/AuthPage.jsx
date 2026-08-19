import { useLocation, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const showRegister = location.pathname === "/register";
  const authNavState = { state: location.state };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {showRegister ? <Register /> : <Login />}
      <div style={{ textAlign: "center" }}>
        {showRegister ? (
          <p style={{ margin: 0 }}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login", authNavState)}
              style={{
                background: "none",
                border: "none",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </p>
        ) : (
          <p style={{ margin: 0 }}>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register", authNavState)}
              style={{
                background: "none",
                border: "none",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
