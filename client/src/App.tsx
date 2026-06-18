import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import CoursesPage from "./pages/CoursesPage";
import DictionaryPage from "./pages/DictionaryPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ReviewPage from "./pages/ReviewPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import SignLanguageTracker from "./components/SignLanguageTracker";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminVocabulary from "./pages/admin/AdminVocabulary";
import AdminFeedback from "./pages/admin/AdminFeedback";

import { useAuth } from "./context/AuthContext";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import DeleteAccountPage from "./pages/DeleteAccountPage";
import PricingPage from "./pages/PricingPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LessonDetailPage from "./pages/LessonDetailPage";
import SavedWordsPage from "./pages/SavedWordsPage";
import AdminFrames from "./pages/admin/AdminFrames";
import FrameStorePage from "./pages/FrameStorePage";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AvaterScene from "./components/AvatarScene";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

const ProtectedRoute = ({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin/dashboard" : "/home-page"}
        replace
      />
    );
  }

  return children;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route path="khoa-hoc" element={<CoursesPage />} />
          <Route path="tu-dien" element={<DictionaryPage />} />
          <Route path="danh-gia" element={<ReviewPage />} />
          <Route path="dieu-khoan" element={<TermsPage />} />
          <Route path="chinh-sach-bao-mat" element={<PrivacyPage />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <SignLanguageTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="home-page"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="ho-so"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="delete-acount"
            element={
              <ProtectedRoute>
                <DeleteAccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="tu-da-luu"
            element={
              <ProtectedRoute>
                <SavedWordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="cua-hang-khung"
            element={
              <ProtectedRoute>
                <FrameStorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="nang-cap"
            element={
              <ProtectedRoute>
                <PricingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="khoa-hoc/:id"
            element={
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="bai-hoc/:id"
            element={
              <ProtectedRoute>
                <LessonDetailPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="avatar-scene"
          element={
            <ProtectedRoute>
              <AvaterScene />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
           <Route path="vocabulary" element={<AdminVocabulary />} />
          <Route path="frames" element={<AdminFrames />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="revenue" element={<AdminRevenue />} />
        </Route>

        <Route
          path="dang-nhap"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="dang-ky"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
