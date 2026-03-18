import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import CoursesPage from "./pages/CoursesPage";
import DictionaryPage from "./pages/DictionaryPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReviewPage from "./pages/ReviewPage";
import SignLanguageTracker from "./components/SignLanguageTracker";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminVocabulary from "./pages/admin/AdminVocabulary";
import AdminFeedback from "./pages/admin/AdminFeedback";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="khoa-hoc" element={<CoursesPage />} />
          <Route path="tu-dien" element={<DictionaryPage />} />
          <Route path="danh-gia" element={<ReviewPage />} />
          <Route path="*" element={<SignLanguageTracker />} />
          <Route
            path="bat-dau"
            element={<Navigate to="/dang-nhap" replace />}
          />
        </Route>
        
        {/* Admin Routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="vocabulary" element={<AdminVocabulary />} />
          <Route path="feedback" element={<AdminFeedback />} />
        </Route>

        <Route path="dang-nhap" element={<LoginPage />} />
        <Route path="dang-ky" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
