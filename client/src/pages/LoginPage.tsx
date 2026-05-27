import { motion, type Variants } from "framer-motion";
import { Apple, Lock, Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import brand from "../assets/brand.jpg";
import AuthNavbar from "../components/AuthNavbar";
import { Button } from "../components/ui/button";
import { viText } from "../locales/vi";
import { useAuth } from "../context/AuthContext";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function LoginPage() {
  const { common, authPages } = viText;
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home-page");
      }
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-svh bg-[#f8faf9]">
      <AuthNavbar
        brandName={common.brandName}
        promptText={authPages.login.noAccount}
        actionText={authPages.login.registerNow}
        actionTo="/dang-ky"
      />

      <section className="grid min-h-[calc(100svh-82px)] place-items-center px-4 py-4 md:py-6">
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="w-full max-w-[640px] rounded-[34px] border border-[#e5ece8] bg-white p-6 shadow-[0_14px_34px_rgba(22,37,48,0.07)] md:p-10"
        >
          <motion.div variants={fadeInUp} className="text-center">
            <div className="inline-flex items-center gap-2.5">
              <img
                src={brand}
                alt={common.brandName}
                className="h-9 w-9 rounded-sm object-cover"
              />
              <span className="text-[1.7rem] font-bold text-[#29613d]">
                {common.brandName}
              </span>
            </div>
            <h1 className="mt-5 text-[clamp(2rem,3.1vw,2.85rem)] font-bold leading-[1.1] text-[#172334]">
              {authPages.login.title}
            </h1>
            <p className="mt-2 text-[#7c8790]">{authPages.login.subtitle}</p>
          </motion.div>

          {error && (
            <motion.div 
              variants={fadeInUp}
              className="mt-6 rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600 border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <motion.form
            variants={container}
            onSubmit={handleSubmit}
            className="mx-auto mt-8 w-full max-w-[520px]"
          >
            <motion.div variants={fadeInUp}>
              <label
                htmlFor="login-email"
                className="text-sm font-semibold text-[#4a5864]"
              >
                {authPages.login.emailLabel}
              </label>
              <div className="mt-2 flex h-14 items-center gap-3 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                <Mail className="h-4.5 w-4.5 text-[#9babb6]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={authPages.login.emailPlaceholder}
                  required
                  className="w-full border-none bg-transparent text-[0.95rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-sm font-semibold text-[#4a5864]"
                >
                  {authPages.login.passwordLabel}
                </label>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#3c7c4a] hover:underline hover:text-[#e4bf3f]"
                >
                  {authPages.login.forgotPassword}
                </button>
              </div>
              <div className="mt-2 flex h-14 items-center gap-3 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                <Lock className="h-4.5 w-4.5 text-[#9babb6]" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authPages.login.passwordPlaceholder}
                  required
                  className="w-full border-none bg-transparent text-[0.95rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-6">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full bg-[#3b7948] text-[1.12rem] font-bold shadow-[0_10px_24px_rgba(59,121,72,0.28)] hover:translate-y-0 hover:bg-[#336b40]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  authPages.login.submitButton
                )}
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex items-center gap-4"
            >
              <span className="h-px flex-1 bg-[#dce5df]" />
              <span className="text-sm font-semibold text-[#9aa7b0]">
                {authPages.socialDivider}
              </span>
              <span className="h-px flex-1 bg-[#dce5df]" />
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-6 grid gap-3 sm:grid-cols-2"
            >
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#dde6e1] bg-white text-[0.95rem] font-semibold text-[#2e3c48] transition-colors hover:bg-[#f7faf8]"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[1.2rem] font-extrabold">
                  <span className="bg-[linear-gradient(90deg,#ea4335_0%,#fbbc05_33%,#34a853_66%,#4285f4_100%)] bg-clip-text text-transparent">
                    G
                  </span>
                </span>
                {authPages.providers.google}
              </button>
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#dde6e1] bg-white text-[0.95rem] font-semibold text-[#2e3c48] transition-colors hover:bg-[#f7faf8]"
              >
                <Apple className="h-5 w-5" />
                {authPages.providers.apple}
              </button>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="mt-8 text-center text-[1.05rem] text-[#8d99a2]"
            >
              {authPages.login.noAccount}{" "}
              <Link
                to="/dang-ky"
                className="font-bold text-[#3c7c4a] hover:underline hover:text-[#e4bf3f]"
              >
                {authPages.login.registerNow}
              </Link>
            </motion.p>
          </motion.form>
        </motion.div>
      </section>
    </div>
  );
}

export default LoginPage;

