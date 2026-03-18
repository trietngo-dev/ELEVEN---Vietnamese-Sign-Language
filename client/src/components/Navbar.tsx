import { NavLink } from "react-router-dom";
import { buttonVariants } from "./ui/button";
import { viText } from "../locales/vi";
import { cn } from "../lib/utils";
import brand from "../assets/brand.jpg";

import { useAuth } from "../context/AuthContext";
import { LogOut, User } from "lucide-react";

function Navbar() {
  const { common, navbar } = viText;
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ece9] bg-white/95 backdrop-blur">
      <div className="container flex min-h-[82px] flex-wrap items-center justify-center gap-4 py-3 lg:justify-between lg:py-0">
        <NavLink
          to={isAuthenticated ? (user?.role === "admin" ? "/admin/dashboard" : "/home-page") : "/"}
          className="inline-flex items-center gap-2.5"
          aria-label={navbar.brandAriaLabel}
        >
          <img
            src={brand}
            alt={common.brandName}
            className="h-12 w-12 shrink-0 rounded-sm object-cover"
          />
          <span className="text-xl font-bold text-[#29613d]">
            {common.brandName}
          </span>
        </NavLink>

        <nav aria-label={navbar.navAriaLabel}>
          <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-4 p-0 lg:gap-[18px]">
            {navbar.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "relative px-0.5 py-1 text-[0.95rem] font-medium text-[#7b8680] transition-colors hover:text-[#234f34]",
                      isActive &&
                        "text-[#2d6f45] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-[#2f7b49]",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="inline-flex items-center gap-3.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-[#1e3039]">{user?.fullName}</span>
                <span className="text-[0.7rem] text-[#7b8680] uppercase tracking-wider">{user?.role}</span>
              </div>
              <div className="h-10 w-10 cursor-pointer rounded-full border-2 border-slate-100 bg-cover bg-center"
                style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=3c6d44&color=fff')` }}
              ></div>
              <button 
                onClick={logout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <NavLink
                to="/dang-nhap"
                className="text-[0.93rem] font-semibold text-[#1e3039]"
              >
                {common.buttons.signIn}
              </NavLink>
              <NavLink
                to="/dang-ky"
                className={buttonVariants({
                  size: "sm",
                  className: "h-10 px-5 text-[0.88rem]",
                })}
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
