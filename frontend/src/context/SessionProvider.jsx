import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import { SessionContext } from "./session-context";

export function SessionProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const token = authService.getToken();
      const savedUser = authService.getUser();
      if (token && savedUser) {
        setUser(savedUser);
      } else if (token && !savedUser) {
        authService.logout();
      }
    } finally {
      setReady(true);
    }
  }, []);

  const login = useCallback((userData, token) => {
    authService.saveToken(token);
    authService.saveUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: Boolean(user && authService.getToken()),
      login,
      logout,
    }),
    [user, ready, login, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
