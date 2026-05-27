import { useLocation } from "react-router-dom";
import AuthSliderLayout from "../components/AuthSliderLayout";

function LoginPage() {
  const location = useLocation();
  const isRegister = location.pathname === "/dang-ky";

  return <AuthSliderLayout initialMode={isRegister ? "register" : "login"} />;
}

export default LoginPage;
