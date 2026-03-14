import { Link, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuth from "./hooks/useAuth";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import TodoListPage from "./pages/TodoListPage";
import WallpaperPage from "./pages/WallpaperPage";
import WorkoutDetailPage from "./pages/WorkoutDetailPage";

const TopNav = () => {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex gap-3 items-center">
        <Link to="/dashboard" className="font-bold text-accent">
          GymForge
        </Link>
        <Link to="/todos" className="text-sm">
          Todos
        </Link>
        <Link to="/wallpaper" className="text-sm">
          Wallpaper
        </Link>
        <button onClick={logout} className="ml-auto text-sm border border-white/20 px-3 py-1 rounded-lg">
          Logout
        </button>
      </div>
    </nav>
  );
};

const App = () => (
  <>
    <TopNav />
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout/:day"
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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </>
);

export default App;
