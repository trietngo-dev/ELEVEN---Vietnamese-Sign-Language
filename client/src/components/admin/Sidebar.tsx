import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  LogOut,
  ChartNoAxesCombined,
  Store
} from 'lucide-react';
import brand from '../../assets/brand.jpg';
import { viText } from '../../locales/vi';
import { useAuth } from '@/context/AuthContext';

const Sidebar: React.FC = () => {
  const { requestLogout } = useAuth();

  const { common } = viText;
  const menuItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Tổng quan', path: '/admin/dashboard' },
    { icon: <Users size={22} />, label: 'Người dùng', path: '/admin/users' },
    { icon: <ChartNoAxesCombined size={22} />, label: 'Doanh thu', path: '/admin/revenue' },
    { icon: <BookOpen size={22} />, label: 'Quản lý khóa học', path: '/admin/courses' },
    { icon: <Store size={22} />, label: 'Cửa hàng khung', path: '/admin/frames' },
    { icon: <BarChart3 size={22} />, label: 'Phản hồi', path: '/admin/feedback' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col fixed h-full z-20">
      <div className="p-6 flex items-center gap-3">
        <img src={brand} alt={common.brandName} className="w-8 h-8 rounded shrink-0 object-cover" />
        <h1 className="text-xl font-bold tracking-tight text-[#3c6c44]">{common.brandName}</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive
                ? 'bg-[#3c6c44] text-white'
                : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-100">
          {/* <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive
                ? 'bg-[#3c6c44] text-white'
                : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Settings size={22} />
            <span>Cài đặt</span>
          </NavLink> */}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden">
            <img
              alt="Admin Avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALKRwxDvfKACdDBTavoVRmukQX20tkH16XAIpHIS4CElMrdN1uuHJrP2K1B53Q4NPMjFpf_6Ubz1XZI7SZjqQEhAI40QWrIRTvIgZHQgEAzuQtSAV_v-nhgIrxDYMUmPnxbTToqvHcLrOPWuSpXkScmv1RB4XARoKo5H0b1kvR2-A5P-zaSOgs7ZRrdoYacARlL5Gz7ciJ_4yV7I_ZSfKlkRm17y2HDtF8tBclr2aXBLEWS_gv4zJhtKorfuDF8ygCeBnc7U4nNPAL"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900">Quản trị viên</span>
            <span className="text-[10px] text-slate-500">admin@eleven.vn</span>
          </div>
        </div>
        <button onClick={requestLogout} className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
