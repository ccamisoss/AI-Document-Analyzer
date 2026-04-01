import { useLocation, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const showRegister = location.pathname === "/register";
  const authNavState = { state: location.state };

  return (
    <div>
      {showRegister ? <Register /> : <Login />}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        {showRegister ? (
          <p>
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
          <p>
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
