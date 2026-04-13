import { Menu, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/auth-context";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="top-bar h-14 flex items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200 flex-shrink-0 z-10">
      {/* 左侧：汉堡菜单 + 面包屑 */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#E8873A]" />
          <span className="text-sm font-semibold text-[#1E3A5F]">道路病害无人机巡检管理系统</span>
          <span className="text-xs text-slate-400 font-mono ml-1">v1.0.0</span>
        </div>
      </div>

      {/* 右侧：通知 + 用户 */}
      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* 用户下拉 */}
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1E3A5F, #2D5F8B)" }}>
              {user?.displayName?.[0] ?? "U"}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700">{user?.displayName}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-700">{user?.displayName}</p>
                  <p className="text-xs text-slate-400">{user?.role === "admin" ? "系统管理员" : "巡检工程师"}</p>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
