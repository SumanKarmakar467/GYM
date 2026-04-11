import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import GeneratingPage from "./pages/GeneratingPage";
import GoalTrackerPage from "./pages/GoalTrackerPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import PlanPage from "./pages/PlanPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import WorkoutDetailPage from "./pages/WorkoutDetailPage";

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <AdminPage />
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
      path="/plan"
      element={
        <ProtectedRoute>
          <PlanPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/workout/:weekNum/:dayNum"
      element={
        <ProtectedRoute>
          <WorkoutDetailPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/workout"
      element={(
        <ProtectedRoute>
          <Navigate to="/plan" replace />
        </ProtectedRoute>
      )}
    />

    <Route
      path="/tracker"
      element={
        <ProtectedRoute>
          <GoalTrackerPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
