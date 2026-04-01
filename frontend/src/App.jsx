import { Route, Routes } from "react-router-dom";
import "./App.css";

import DashboardLayout from "./layouts/DashboardLayout";

import AnalyzeForm from "./pages/AnalyzeForm";
import Dashboard from "./pages/Dashboard";
import DocumentDetail from "./pages/DocumentDetail";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/documentDetail" element={<DocumentDetail />} />
        <Route path="/analyze" element={<AnalyzeForm />} />
      </Route>
    </Routes>
  );
}

export default App;
