import { useState } from "react";
import authService from "../../../services/auth.service";
import styles from "../index.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../../../hooks/useSession";

function Register() {
  const { login: setSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  const handleRegisterSuccess = (userData, token) => {
    setSession(userData, token);
    navigate(from, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.register(email, password);

      handleRegisterSuccess(result.user, result.token);
    } catch (err) {
      setError(err.message || "Error registering user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Sign Up</h1>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={styles.formInput}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={styles.formInput}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
            <small className={styles.formHint}>
              Password must be at least 8 characters
            </small>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={styles.authButton}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
