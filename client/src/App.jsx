import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import TodoListPage from "./pages/TodoListPage";
import WallpaperPage from "./pages/WallpaperPage";
import WorkoutDetailPage from "./pages/WorkoutDetailPage";

const App = () => {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <PageTransition>
        <Routes location={location}>
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
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
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
            path="/workout"
            element={
              <ProtectedRoute>
                <WorkoutDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/todos"
            element={
              <ProtectedRoute>
                <TodoListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallpaper"
            element={
              <ProtectedRoute>
                <WallpaperPage />
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

          <Route path="/tracker" element={<Navigate to="/todos" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </ErrorBoundary>
  );
};

export default App;
