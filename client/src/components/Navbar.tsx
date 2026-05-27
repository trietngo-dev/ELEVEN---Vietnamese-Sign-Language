import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { viText } from "../locales/vi";
import { cn } from "../lib/utils";
import brand from "../assets/brand.jpg";

import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

function Navbar() {
  const { common, navbar } = viText;
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  
  const isLandingPage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLandingPage) return;
    
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLandingPage]);

  return (
    <header className={cn(
      "z-50 transition-all duration-300",
      isLandingPage 
        ? scrolled
          ? "fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-emerald-50/10 shadow-sm shadow-[#3c6c44]/[0.02]"
          : "absolute top-0 left-0 right-0 bg-transparent border-none" 
        : "sticky top-0 bg-white/95 border-b border-slate-100"
    )}>
      <div className="container relative flex min-h-[72px] items-center justify-between gap-6 py-2">
        {/* Brand */}
        <NavLink
          to={
            isAuthenticated
              ? user?.role === "admin"
                ? "/admin/dashboard"
                : "/home-page"
              : "/"
          }
          className="inline-flex items-center gap-2.5 shrink-0 animate-fade-in"
          aria-label={navbar.brandAriaLabel}
        >
          <img
            src={brand}
            alt={common.brandName}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
          <span className="text-xl font-bold text-[#29613d]">
            {common.brandName}
          </span>
        </NavLink>

        {/* Navigation */}
        <nav aria-label={navbar.navAriaLabel} className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <ul className="m-0 flex list-none items-center gap-8 p-0">
            {navbar.items
              .filter(item => isAuthenticated || item.to !== "/tu-dien")
              .map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "relative py-1 text-[15px] font-medium text-slate-500 transition-colors hover:text-[#3c6c44]",
                        isActive &&
                          "text-[#3c6c44] font-semibold",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>

        {/* Auth buttons */}
        <div className="inline-flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800">
                  {user?.fullName}
                </span>
                <span className="text-[0.65rem] text-slate-400 uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
              <NavLink to="/ho-so" className="shrink-0 transition-transform hover:scale-105">
                <div
                  className="h-9 w-9 cursor-pointer rounded-full border-2 border-slate-100 bg-cover bg-center shadow-sm"
                  style={{
                    backgroundImage: `url('https://ui-avatars.com/api/?name=${user?.fullName || "User"}&background=3c6d44&color=fff')`,
                  }}
                ></div>
              </NavLink>
              <button
                onClick={logout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <NavLink
                to="/dang-nhap"
                className="rounded-full border border-slate-200 px-5 py-2 text-[14px] font-semibold text-slate-700 transition-all hover:border-[#3c6c44]/30 hover:bg-[#f8fdf9]"
              >
                {common.buttons.signIn}
              </NavLink>
              <NavLink
                to="/dang-ky"
                className="rounded-full bg-[#3c6c44] px-6 py-2 text-[14px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {common.buttons.start}
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
