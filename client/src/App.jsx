import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import GeneratingPage from "./pages/GeneratingPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import RegisterPage from "./pages/RegisterPage";

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route
      path="/onboarding"
      element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/generating"
      element={
        <ProtectedRoute>
          <GeneratingPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
