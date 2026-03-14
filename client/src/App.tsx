import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { viText } from "./locales/vi";
import LandingPage from "./pages/LandingPage";
import PlaceholderPage from "./pages/PlaceholderPage";

function App() {
  const { placeholderPages } = viText;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route
          path="khoa-hoc"
          element={
            <PlaceholderPage
              title={placeholderPages.courses.title}
              subtitle={placeholderPages.courses.subtitle}
            />
          }
        />
        <Route
          path="tu-dien"
          element={
            <PlaceholderPage
              title={placeholderPages.dictionary.title}
              subtitle={placeholderPages.dictionary.subtitle}
            />
          }
        />
        <Route
          path="danh-gia"
          element={
            <PlaceholderPage
              title={placeholderPages.review.title}
              subtitle={placeholderPages.review.subtitle}
            />
          }
        />
        <Route
          path="dang-nhap"
          element={
            <PlaceholderPage
              title={placeholderPages.signIn.title}
              subtitle={placeholderPages.signIn.subtitle}
            />
          }
        />
        <Route path="bat-dau" element={<Navigate to="/dang-nhap" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
