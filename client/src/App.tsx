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
        <Route path="dang-nhap" element={<LoginPage />} />
        <Route path="dang-ky" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
