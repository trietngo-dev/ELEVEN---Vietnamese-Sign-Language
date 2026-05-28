import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { viText } from "../locales/vi";
import { cn } from "../lib/utils";
import brand from "../assets/brand.jpg";

import { useAuth } from "../context/AuthContext";
import { LogOut, Bell, Crown, BookOpen, Clock } from "lucide-react";
import { tokenStorage } from "../lib/auth";
import { notificationsApi, type NotificationItem } from "../lib/notifications";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Navbar() {
  const { common, navbar } = viText;
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const popoverRef = useRef<HTMLDivElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isLandingPage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  // Sync avatar image
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setAvatarUrl(null);
      return;
    }
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_BASE_URL}/api/users/${user.id}`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((userData) => {
        if (userData && userData.avatarMediaId) {
          return fetch(`${API_BASE_URL}/api/media_assets/${userData.avatarMediaId}`, { headers });
        }
        return null;
      })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((mediaData) => {
        if (mediaData && mediaData.fileUrl) {
          setAvatarUrl(mediaData.fileUrl);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, user]);

  // Load user notifications
  const fetchNotifications = () => {
    if (!isAuthenticated || !user?.id) return;
    notificationsApi.getUserNotifications(user.id).then(data => {
      setNotifications(data);
    });
  };

  useEffect(() => {
    fetchNotifications();

    // Check for notifications periodically (every 10 seconds)
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    const ok = await notificationsApi.markAsRead(item.id, item);
    if (ok) {
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    }
  };

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

  const avatarSrc = avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || "User"}&background=3c6d44&color=fff`;

  return (
    <header className={cn(
      "z-50 transition-all duration-300",
      isLandingPage 
        ? scrolled
          ? "fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-emerald-50/10 shadow-sm shadow-[#3c6c44]/[0.02]"
          : "absolute top-0 left-0 right-0 bg-transparent border-none" 
        : "sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100/50 shadow-sm shadow-slate-100/10"
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

        {/* Auth & Notifications */}
        <div className="inline-flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 sm:gap-4 relative" ref={popoverRef}>
              
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={cn(
                    "p-2 text-slate-500 hover:text-[#3c6c44] hover:bg-slate-100/50 rounded-full transition-all duration-200 shrink-0 relative",
                    showNotifications && "bg-slate-100 text-[#3c6c44]"
                  )}
                  title="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Glassmorphic Popover */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2.5 w-[310px] sm:w-[340px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-[0_15px_35px_rgba(24,35,51,0.08)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-800">Thông báo</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {unreadCount} tin nhắn mới
                        </span>
                      )}
                    </div>
                    <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-50 scrollbar-none">
                      {notifications.length > 0 ? (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleMarkAsRead(item)}
                            className={cn(
                              "px-5 py-3 flex gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors relative",
                              !item.isRead && "bg-emerald-50/[0.12]"
                            )}
                          >
                            {!item.isRead && (
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 size-1.5 bg-emerald-500 rounded-full" />
                            )}
                            <div className="mt-0.5 shrink-0">
                              {item.type === "subscription" ? (
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100/30">
                                  <Crown className="h-4 w-4 text-amber-600" />
                                </div>
                              ) : item.type === "learning" ? (
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/30">
                                  <BookOpen className="h-4 w-4 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100/30">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <p className={cn(
                                "text-xs text-slate-800 leading-snug break-words",
                                !item.isRead ? "font-extrabold" : "font-semibold"
                              )}>
                                {item.title}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-normal break-words font-medium">
                                {item.message}
                              </p>
                              <span className="text-[9px] font-semibold text-slate-400 block pt-1 select-none">
                                {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-slate-400 text-xs font-semibold select-none">
                          Không có thông báo nào.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User details */}
              <div className="hidden md:flex flex-col items-end shrink-0">
                <span className="text-sm font-bold text-slate-800 leading-none">
                  {user?.fullName}
                </span>
                <span className="text-[0.62rem] text-slate-400 font-bold uppercase tracking-wider mt-1 select-none">
                  {user?.role === "admin" ? "Quản trị viên" : "Học viên"}
                </span>
              </div>

              {/* User Avatar */}
              <NavLink to="/ho-so" className="shrink-0 transition-transform hover:scale-105">
                <div
                  className="h-9 w-9 cursor-pointer rounded-full border-2 border-slate-100 bg-cover bg-center shadow-sm"
                  style={{
                    backgroundImage: `url('${avatarSrc}')`,
                  }}
                ></div>
              </NavLink>

              {/* Logout Button */}
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
