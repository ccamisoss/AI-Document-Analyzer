import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthPage = ({ setUser, setIsAuthenticated }) => {
  const [showRegister, setShowRegister] = useState(false);
  
  return (
      <div>
        {showRegister ? (
          <Register setUser={setUser} setIsAuthenticated={setIsAuthenticated} setShowRegister={setShowRegister} />
        ) : (
          <Login setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
        )}
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          {showRegister ? (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setShowRegister(false)}
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
              Don't have an account?{" "}
              <button
                onClick={() => setShowRegister(true)}
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
};

export default AuthPage