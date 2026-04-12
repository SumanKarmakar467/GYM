import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import InstallBanner from "./components/InstallBanner";
import PageLoader from "./components/PageLoader";
import PageTransition from "./components/PageTransition";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import ProtectedRoute from "./components/ProtectedRoute";

const AdminPage = lazy(() => import("./pages/AdminPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const WorkoutDetailPage = lazy(() => import("./pages/WorkoutDetailPage"));
const TodoListPage = lazy(() => import("./pages/TodoListPage"));
const WallpaperPage = lazy(() => import("./pages/WallpaperPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const App = () => {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <InstallBanner />
      <PWAUpdatePrompt />
      <PageTransition>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </ErrorBoundary>
  );
};

export default App;
