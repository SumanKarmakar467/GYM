import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
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

const PageWrapper = ({ children }) => <div className="page-enter">{children}</div>;

const App = () => (
  <ErrorBoundary>
    <Routes>
      <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
      <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
      <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <PageWrapper><AdminPage /></PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <PageWrapper><OnboardingPage /></PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PageWrapper><DashboardPage /></PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <PageWrapper><WorkoutDetailPage /></PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/todos"
        element={
          <ProtectedRoute>
            <PageWrapper><TodoListPage /></PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wallpaper"
        element={
          <ProtectedRoute>
            <PageWrapper><WallpaperPage /></PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <PageWrapper><ProfilePage /></PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route path="/tracker" element={<Navigate to="/todos" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </ErrorBoundary>
);

export default App;
