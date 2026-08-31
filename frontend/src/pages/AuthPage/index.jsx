import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index.module.css";

import Login from "./components/Login";
import Register from "./components/Register";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const showRegister = location.pathname === "/register";
  const authNavState = { state: location.state };

  return (
    <div className={styles.container}>
      {showRegister ? <Register /> : <Login />}
      <div className={styles.whiteContainer}>
        {showRegister ? (
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login", authNavState)}
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
            >
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
