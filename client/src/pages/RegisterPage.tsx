import { motion, type Variants } from "framer-motion";
import { Apple, Eye, EyeOff, Lock, Mail, UserRound, Loader2 } from "lucide-react";
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

function RegisterPage() {
  const { common, authPages } = viText;
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ fullName, email, password });
      navigate("/dang-nhap");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-svh bg-[#f8faf9]">
      <AuthNavbar
        brandName={common.brandName}
        promptText={authPages.register.hasAccount}
        actionText={authPages.register.signInNow}
        actionTo="/dang-nhap"
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
            <h1 className="mt-5 text-[clamp(1.95rem,3vw,2.75rem)] font-bold leading-[1.1] text-[#172334]">
              {authPages.register.title}
            </h1>
            <p className="mt-2 text-[#7c8790]">{authPages.register.subtitle}</p>
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
                htmlFor="register-name"
                className="text-sm font-semibold text-[#4a5864]"
              >
                {authPages.register.nameLabel}
              </label>
              <div className="mt-2 flex h-14 items-center gap-3 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                <UserRound className="h-4.5 w-4.5 text-[#9babb6]" />
                <input
                  id="register-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={authPages.register.namePlaceholder}
                  required
                  className="w-full border-none bg-transparent text-[0.95rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-5">
              <label
                htmlFor="register-email"
                className="text-sm font-semibold text-[#4a5864]"
              >
                {authPages.register.emailLabel}
              </label>
              <div className="mt-2 flex h-14 items-center gap-3 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                <Mail className="h-4.5 w-4.5 text-[#9babb6]" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={authPages.register.emailPlaceholder}
                  required
                  className="w-full border-none bg-transparent text-[0.95rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-5">
              <label
                htmlFor="register-password"
                className="text-sm font-semibold text-[#4a5864]"
              >
                {authPages.register.passwordLabel}
              </label>
              <div className="mt-2 flex h-14 items-center gap-3 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                <Lock className="h-4.5 w-4.5 text-[#9babb6]" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authPages.register.passwordPlaceholder}
                  required
                  className="w-full border-none bg-transparent text-[0.95rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="text-[#9babb6]"
                  aria-label={
                    showPassword
                      ? authPages.register.hidePasswordAria
                      : authPages.register.showPasswordAria
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-5">
              <label
                htmlFor="register-confirm-password"
                className="text-sm font-semibold text-[#4a5864]"
              >
                {authPages.register.confirmPasswordLabel}
              </label>
              <div className="mt-2 flex h-14 items-center gap-3 rounded-full border border-[#e3eae6] bg-[#f8faf9] px-4 focus-within:border-[#a8c0af]">
                <Lock className="h-4.5 w-4.5 text-[#9babb6]" />
                <input
                  id="register-confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={authPages.register.confirmPasswordPlaceholder}
                  required
                  className="w-full border-none bg-transparent text-[0.95rem] text-[#2a3a46] outline-none placeholder:text-[#a7b4bd]"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-6">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full bg-[#3b7948] text-[1.08rem] font-bold shadow-[0_10px_24px_rgba(59,121,72,0.28)] hover:translate-y-0 hover:bg-[#336b40]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  authPages.register.submitButton
                )}
              </Button>
            </motion.div>

            <motion.label
              variants={fadeInUp}
              htmlFor="register-agreement"
              className="mt-4 flex cursor-pointer items-start gap-2.5 text-[0.92rem] text-[#65747d]"
            >
              <input
                id="register-agreement"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded border-[#bfcfc4] accent-[#3b7948]"
              />
              <span>
                {authPages.register.agreementText}{" "}
                <Link
                  to="/dang-nhap"
                  className="font-bold text-[#3c7c4a] hover:underline hover:text-[#e4bf3f]"
                >
                  {authPages.register.termLink}
                </Link>
                {" và "}
                <Link
                  to="/dang-nhap"
                  className="font-bold text-[#3c7c4a] hover:underline hover:text-[#e4bf3f]"
                >
                  {authPages.register.privacyLink}
                </Link>
                .
              </span>
            </motion.label>

            <motion.div
              variants={fadeInUp}
              className="mt-4 flex items-center gap-4"
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
              className="mt-8 text-center text-[1rem] text-[#8d99a2]"
            >
              {authPages.register.hasAccount}{" "}
              <Link
                to="/dang-nhap"
                className="font-bold text-[#3c7c4a] hover:underline hover:text-[#e4bf3f]"
              >
                {authPages.register.signInNow}
              </Link>
            </motion.p>
          </motion.form>
        </motion.div>
      </section>
    </div>
  );
}

export default RegisterPage;

