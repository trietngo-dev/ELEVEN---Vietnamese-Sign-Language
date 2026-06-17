import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, UserRound, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import brand from "../assets/brand.jpg";
import loginImg from "../assets/login.png";
import registerImg from "../assets/register.png";
import { Button } from "./ui/button";
import { viText } from "../locales/vi";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

interface AuthSliderLayoutProps {
  initialMode: "login" | "register";
}

function AuthSliderLayout({ initialMode }: AuthSliderLayoutProps) {
  const { common, authPages } = viText;
  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);

  // Sync mode state with prop change (e.g., if user navigates via browser back/forward buttons)
  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  // Google Sign In Integration
  const isLoginRef = useRef(isLogin);
  useEffect(() => {
    isLoginRef.current = isLogin;
  }, [isLogin]);

  const [googleInitialized, setGoogleInitialized] = useState(false);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response.credential) return;
    
    const currentIsLogin = isLoginRef.current;
    if (currentIsLogin) {
      setIsLoginSubmitting(true);
      setLoginError(null);
    } else {
      setIsRegSubmitting(true);
      setRegError(null);
    }

    try {
      const user = await loginWithGoogle(response.credential);
      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home-page");
      }
    } catch (err: any) {
      const errMsg = err.message || "Đăng nhập Google thất bại. Vui lòng thử lại.";
      if (currentIsLogin) {
        setLoginError(errMsg);
      } else {
        setRegError(errMsg);
      }
    } finally {
      setIsLoginSubmitting(false);
      setIsRegSubmitting(false);
    }
  };

  useEffect(() => {
    const initGoogleGSI = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "100827282828-mockclientid.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        setGoogleInitialized(true);
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGoogleGSI();
    } else {
      const checkInterval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          initGoogleGSI();
          clearInterval(checkInterval);
        }
      }, 500);

      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener("load", initGoogleGSI);
      }

      return () => {
        clearInterval(checkInterval);
        if (script) {
          script.removeEventListener("load", initGoogleGSI);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (googleInitialized && (window as any).google?.accounts?.id) {
      const timer = setTimeout(() => {
        const loginBtn = document.getElementById("google-signin-btn-login");
        if (loginBtn) {
          (window as any).google.accounts.id.renderButton(loginBtn, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "pill",
            width: 240,
          });
        }

        const registerBtn = document.getElementById("google-signin-btn-register");
        if (registerBtn) {
          (window as any).google.accounts.id.renderButton(registerBtn, {
            theme: "outline",
            size: "large",
            text: "signup_with",
            shape: "pill",
            width: 240,
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [googleInitialized, isLogin]);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);

  const handleToggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    // Clear errors when switching
    setLoginError(null);
    setRegError(null);
    // Update the URL smoothly
    navigate(newMode ? "/dang-nhap" : "/dang-ky", { replace: true });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoginSubmitting(true);

    try {
      const user = await login({ email: loginEmail, password: loginPassword });
      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home-page");
      }
    } catch (err: any) {
      setLoginError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword !== regConfirmPassword) {
      setRegError("Mật khẩu không khớp!");
      return;
    }

    setIsRegSubmitting(true);

    try {
      await register({ fullName: regName, email: regEmail, password: regPassword });
      // Transition back to login smoothly
      setIsLogin(true);
      navigate("/dang-nhap", { replace: true });
    } catch (err: any) {
      setRegError(err.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsRegSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-[#f8fdf8] to-[#edf6e4] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Soft animated ambient auroras */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -20, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 right-[15%] size-[500px] rounded-full bg-[#e4bf3f]/[0.05] blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -20, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 left-[10%] size-[600px] rounded-full bg-[#3c6c44]/[0.04] blur-[120px]"
        />
      </div>

      {/* Floating Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 backdrop-blur-md px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
      >
        <ArrowLeft size={14} className="text-[#3c6c44]" />
        Về trang chủ
      </Link>

      {/* Main Authentication Container */}
      <div className="w-full max-w-[1000px] h-[650px] md:h-[680px] bg-white rounded-[32px] border border-slate-100/90 shadow-[0_20px_50px_rgba(22,37,48,0.06)] overflow-hidden flex relative z-10">
        
        {/* Left Column: Login Form */}
        <div className={cn("w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-10 z-10 bg-white overflow-y-auto scrollbar-none", !isLogin && "hidden md:flex")}>
          <AnimatePresence>
            {isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] flex flex-col"
              >
                {/* Brand */}
                <div className="flex items-center gap-2.5 justify-center mb-6">
                  <img src={brand} alt={common.brandName} className="h-8 w-8 rounded-lg object-cover" />
                  <span className="text-[1.35rem] font-bold text-[#29613d]">{common.brandName}</span>
                </div>

                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-[#172334]">{authPages.login.title}</h1>
                  <p className="text-xs text-[#7c8790] mt-1">{authPages.login.subtitle}</p>
                </div>

                {loginError && (
                  <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600 border border-red-100">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="login-email" className="text-xs font-bold text-[#4a5864]">
                      {authPages.login.emailLabel}
                    </label>
                    <div className="mt-1.5 flex h-11 items-center gap-2.5 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                      <Mail className="h-4 w-4 text-[#9babb6] shrink-0" />
                      <input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder={authPages.login.emailPlaceholder}
                        required
                        className="w-full border-none bg-transparent text-[0.88rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="text-xs font-bold text-[#4a5864]">
                        {authPages.login.passwordLabel}
                      </label>
                      <button type="button" className="text-xs font-bold text-[#3c7c4a] hover:underline">
                        {authPages.login.forgotPassword}
                      </button>
                    </div>
                    <div className="mt-1.5 flex h-11 items-center gap-2.5 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                      <Lock className="h-4 w-4 text-[#9babb6] shrink-0" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder={authPages.login.passwordPlaceholder}
                        required
                        className="w-full border-none bg-transparent text-[0.88rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#9babb6] hover:text-slate-600 shrink-0"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoginSubmitting}
                    className="h-11 w-full bg-[#3b7948] text-sm font-bold shadow-md hover:bg-[#336b40] rounded-full mt-2"
                  >
                    {isLoginSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : authPages.login.submitButton}
                  </Button>

                  <div className="flex items-center gap-3 my-2">
                    <span className="h-px flex-1 bg-[#dce5df]" />
                    <span className="text-[10px] font-bold text-[#9aa7b0] uppercase tracking-wider">{authPages.socialDivider}</span>
                    <span className="h-px flex-1 bg-[#dce5df]" />
                  </div>

                  <div className="flex justify-center items-center w-full my-1">
                    <div className="h-10 flex items-center justify-center overflow-hidden">
                      {googleInitialized ? (
                        <div id="google-signin-btn-login" className="w-full flex justify-center"></div>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex h-10 px-6 items-center justify-center gap-2 rounded-full border border-[#dde6e1] bg-white text-[0.82rem] font-bold text-[#2e3c48] hover:bg-[#f7faf8] w-[240px]"
                        >
                          <span className="text-[1.05rem] font-black bg-[linear-gradient(90deg,#ea4335_0%,#fbbc05_33%,#34a853_66%,#4285f4_100%)] bg-clip-text text-transparent">G</span>
                          {authPages.providers.google}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-center text-xs text-[#8d99a2] mt-4">
                    {authPages.login.noAccount}{" "}
                    <button type="button" onClick={handleToggleMode} className="font-bold text-[#3c7c4a] hover:underline cursor-pointer">
                      {authPages.login.registerNow}
                    </button>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Register Form */}
        <div className={cn("w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-10 z-10 bg-white overflow-y-auto scrollbar-none", isLogin && "hidden md:flex")}>
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] flex flex-col"
              >
                {/* Brand */}
                <div className="flex items-center gap-2.5 justify-center mb-5">
                  <img src={brand} alt={common.brandName} className="h-8 w-8 rounded-lg object-cover" />
                  <span className="text-[1.35rem] font-bold text-[#29613d]">{common.brandName}</span>
                </div>

                <div className="text-center mb-5">
                  <h1 className="text-2xl font-bold text-[#172334]">{authPages.register.title}</h1>
                  <p className="text-xs text-[#7c8790] mt-1">{authPages.register.subtitle}</p>
                </div>

                {regError && (
                  <div className="mb-3 rounded-xl bg-red-50 p-2.5 text-center text-xs font-semibold text-red-600 border border-red-100">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
                  <div>
                    <label htmlFor="reg-name" className="text-xs font-bold text-[#4a5864]">
                      {authPages.register.nameLabel}
                    </label>
                    <div className="mt-1 flex h-10 items-center gap-2.5 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                      <UserRound className="h-3.5 w-3.5 text-[#9babb6] shrink-0" />
                      <input
                        id="reg-name"
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={authPages.register.namePlaceholder}
                        required
                        className="w-full border-none bg-transparent text-[0.82rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="text-xs font-bold text-[#4a5864]">
                      {authPages.register.emailLabel}
                    </label>
                    <div className="mt-1 flex h-10 items-center gap-2.5 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                      <Mail className="h-3.5 w-3.5 text-[#9babb6] shrink-0" />
                      <input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder={authPages.register.emailPlaceholder}
                        required
                        className="w-full border-none bg-transparent text-[0.82rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-password" className="text-xs font-bold text-[#4a5864]">
                        {authPages.register.passwordLabel}
                      </label>
                      <div className="mt-1 flex h-10 items-center gap-2 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-3.5 focus-within:border-[#a8c0af]">
                        <Lock className="h-3.5 w-3.5 text-[#9babb6] shrink-0" />
                        <input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Mật khẩu"
                          required
                          className="w-full border-none bg-transparent text-[0.82rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[#9babb6] hover:text-slate-600 shrink-0"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reg-confirm" className="text-xs font-bold text-[#4a5864]">
                        {authPages.register.confirmPasswordLabel}
                      </label>
                      <div className="mt-1 flex h-10 items-center gap-2 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-3.5 focus-within:border-[#a8c0af]">
                        <Lock className="h-3.5 w-3.5 text-[#9babb6] shrink-0" />
                        <input
                          id="reg-confirm"
                          type={showPassword ? "text" : "password"}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Xác nhận"
                          required
                          className="w-full border-none bg-transparent text-[0.82rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[#9babb6] hover:text-slate-600 shrink-0"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <label
                    htmlFor="register-agreement"
                    className="flex cursor-pointer items-start gap-2 text-[10px] text-[#65747d] select-none my-1"
                  >
                    <input
                      id="register-agreement"
                      type="checkbox"
                      required
                      className="mt-0.5 h-3.5 w-3.5 rounded border-[#bfcfc4] accent-[#3b7948] cursor-pointer"
                    />
                    <span className="leading-tight text-left">
                      {authPages.register.agreementText}{" "}
                      <Link to="/dang-nhap" className="font-bold text-[#3c7c4a] hover:underline">
                        {authPages.register.termLink}
                      </Link>
                      {" và "}
                      <Link to="/dang-nhap" className="font-bold text-[#3c7c4a] hover:underline">
                        {authPages.register.privacyLink}
                      </Link>
                      .
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={isRegSubmitting}
                    className="h-10 w-full bg-[#3b7948] text-sm font-bold shadow-md hover:bg-[#336b40] rounded-full mt-2"
                  >
                    {isRegSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : authPages.register.submitButton}
                  </Button>

                  <div className="flex items-center gap-3 my-1">
                    <span className="h-px flex-1 bg-[#dce5df]" />
                    <span className="text-[9px] font-bold text-[#9aa7b0] uppercase tracking-wider">{authPages.socialDivider}</span>
                    <span className="h-px flex-1 bg-[#dce5df]" />
                  </div>

                  <div className="flex justify-center items-center w-full my-1">
                    <div className="h-9 flex items-center justify-center overflow-hidden">
                      {googleInitialized ? (
                        <div id="google-signin-btn-register" className="w-full flex justify-center"></div>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex h-9 px-6 items-center justify-center gap-2 rounded-full border border-[#dde6e1] bg-white text-[0.78rem] font-bold text-[#2e3c48] hover:bg-[#f7faf8] w-[240px]"
                        >
                          <span className="text-[1rem] font-black bg-[linear-gradient(90deg,#ea4335_0%,#fbbc05_33%,#34a853_66%,#4285f4_100%)] bg-clip-text text-transparent">G</span>
                          {authPages.providers.google}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-center text-xs text-[#8d99a2] mt-3">
                    {authPages.register.hasAccount}{" "}
                    <button type="button" onClick={handleToggleMode} className="font-bold text-[#3c7c4a] hover:underline cursor-pointer">
                      {authPages.register.signInNow}
                    </button>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sliding Image Overlay Panel (Only desktop) */}
        <motion.div
          animate={{ x: isLogin ? "100%" : "0%" }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="absolute top-0 left-0 bottom-0 w-1/2 z-20 overflow-hidden hidden md:block bg-[#f4fbf6]"
        >
          {/* Glassmorphic Brand Tag Overlay */}
          <div className="absolute top-6 left-6 z-30 rounded-2xl bg-white/70 backdrop-blur-md px-4 py-2 border border-white/50 shadow-sm flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#29613d] flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#3c6c44] animate-pulse" />
              Eleven VSL Platform
            </span>
          </div>

          {/* Cross-fading premium images */}
          <img
            src={loginImg}
            alt="Login Illustration"
            className={cn(
              "absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-700 ease-in-out",
              isLogin ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          />
          <img
            src={registerImg}
            alt="Register Illustration"
            className={cn(
              "absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-700 ease-in-out",
              !isLogin ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          />

          {/* Slogan Overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#29613d]/90 via-[#29613d]/60 to-transparent p-8 text-white flex flex-col">
            <h3 className="text-lg font-bold">Học Ngôn Ngữ Ký Hiệu Dễ Dàng</h3>
            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
              Trải nghiệm học tập ứng dụng trí tuệ nhân tạo nhận diện cử chỉ thông minh đầu tiên tại Việt Nam.
            </p>
          </div>
        </motion.div>

        {/* Middle Toggle Slide Button is removed to prevent overlapping illustration details */}

      </div>
    </div>
  );
}

export default AuthSliderLayout;
