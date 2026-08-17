import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  LogOut,
  ChartNoAxesCombined,
  Store,
  PanelLeftClose,
} from 'lucide-react';
import brand from '../../assets/brand.jpg';
import { viText } from '../../locales/vi';
import { useAuth } from '@/context/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const { requestLogout } = useAuth();
  const { common } = viText;

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tổng quan', path: '/admin/dashboard' },
    { icon: <Users size={20} />, label: 'Người dùng', path: '/admin/users' },
    { icon: <ChartNoAxesCombined size={20} />, label: 'Doanh thu', path: '/admin/revenue' },
    { icon: <BookOpen size={20} />, label: 'Quản lý khóa học', path: '/admin/courses' },
    { icon: <Store size={20} />, label: 'Cửa hàng khung', path: '/admin/frames' },
    { icon: <BarChart3 size={20} />, label: 'Phản hồi', path: '/admin/feedback' },
  ];

  return (
    <aside className={cn(
      "border-r border-slate-200 bg-white flex flex-col fixed h-full z-20 transition-all duration-300 ease-in-out select-none",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header with Logo & Toggle Button */}
      <div className={cn(
        "p-4 sm:p-5 flex items-center border-b border-slate-100 min-h-[64px]",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <img src={brand} alt={common.brandName} className="w-8 h-8 rounded-lg shrink-0 object-cover" />
          {!isCollapsed && (
            <h1 className="text-xl font-bold tracking-tight text-[#3c6c44] truncate">
              {common.brandName}
            </h1>
          )}
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              "p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0",
              isCollapsed && "hidden" // Header in AdminLayout has toggle when collapsed
            )}
            title="Thu gọn thanh bên"
            aria-label="Thu gọn thanh bên"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-xl transition-all font-semibold text-sm",
                isCollapsed ? "justify-center h-11 w-full px-0" : "gap-3.5 px-3.5 py-2.5",
                isActive
                  ? "bg-[#3c6c44] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              )
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <div className={cn(
          "flex items-center gap-3 p-1.5 rounded-xl",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
            <img
              alt="Admin Avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALKRwxDvfKACdDBTavoVRmukQX20tkH16XAIpHIS4CElMrdN1uuHJrP2K1B53Q4NPMjFpf_6Ubz1XZI7SZjqQEhAI40QWrIRTvIgZHQgEAzuQtSAV_v-nhgIrxDYMUmPnxbTToqvHcLrOPWuSpXkScmv1RB4XARoKo5H0b1kvR2-A5P-zaSOgs7ZRrdoYacARlL5Gz7ciJ_4yV7I_ZSfKlkRm17y2HDtF8tBclr2aXBLEWS_gv4zJhtKorfuDF8ygCeBnc7U4nNPAL"
              className="w-full h-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">Quản trị viên</span>
              <span className="text-[10px] text-slate-400 font-medium truncate">admin@eleven.vn</span>
            </div>
          )}
        </div>

        <button
          onClick={requestLogout}
          title={isCollapsed ? "Đăng xuất" : undefined}
          className={cn(
            "w-full flex items-center text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-bold",
            isCollapsed ? "justify-center h-10 px-0" : "gap-3 px-3.5 py-2.5"
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
