import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import DashboardLayout from "./layouts/DashboardLayout";

import AnalyzeForm from "./pages/AnalyzeForm";
import Dashboard from "./pages/Dashboard";
import DocumentDetail from "./pages/DocumentDetail";
import AuthPage from "./pages/AuthPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthPage setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
        }
      />
      <Route
        path="/register"
        element={
          <AuthPage
            showRegister={true}
            setUser={setUser}
            setIsAuthenticated={setIsAuthenticated}
          />
        }
      />
      <Route
        path="/"
        element={
          <DashboardLayout
            setIsAuthenticated={setIsAuthenticated}
            setUser={setUser}
            user={user}
          />
        }
      >
        <Route
          index
          element={
            <Dashboard
              setIsAuthenticated={setIsAuthenticated}
              setUser={setUser}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route path="/documentDetail" element={<DocumentDetail />} />
        <Route path="/analyze" element={<AnalyzeForm />} />
      </Route>
    </Routes>
  );
}

export default App;
