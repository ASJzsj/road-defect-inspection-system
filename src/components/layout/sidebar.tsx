import { NavLink, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Cpu, FolderOpen, LayoutDashboard, Bug, Upload, ScanLine, FileText, X,
  ChevronDown, ChevronRight, MapPin, Circle
} from "lucide-react";
import { mockProjects } from "../../data/mock-projects";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const projectMenuItems = [
  { path: "dashboard",  icon: LayoutDashboard, label: "数据看板" },
  { path: "defects",    icon: Bug,             label: "病害管理" },
  { path: "import",     icon: Upload,          label: "影像导入" },
  { path: "analysis",   icon: ScanLine,        label: "AI 识别检测" },
  { path: "report",     icon: FileText,        label: "检测报告" },
];

const STATUS_DOT: Record<string, string> = {
  active: "bg-blue-400",
  completed: "bg-green-400",
  pending: "bg-amber-400",
  archived: "bg-slate-400",
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [projectListOpen, setProjectListOpen] = useState(true);

  const isProjectsActive = location.pathname === "/projects" || location.pathname.startsWith("/projects/");

  return (
    <aside className={`
      sidebar fixed lg:static inset-y-0 left-0 z-30 flex flex-col
      w-64 transition-transform duration-300 ease-in-out
      lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `} style={{ background: "linear-gradient(180deg, #1E3A5F 0%, #0F1F3D 100%)" }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(232,135,58,0.15)", border: "1px solid rgba(232,135,58,0.3)" }}>
            <Cpu className="w-5 h-5 text-[#E8873A]" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">道路病害巡检</div>
            <div className="text-slate-400 text-xs">智能管理平台 <span className="text-[#E8873A]">v1.0.0</span></div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {/* 主菜单 */}
        <div className="mb-2">
          <p className="text-slate-500 text-xs font-medium px-3 mb-1 uppercase tracking-wider">主菜单</p>

          {/* 工程项目 - 可折叠 */}
          <div>
            <button
              onClick={() => {
                setProjectListOpen(v => !v);
                navigate("/projects");
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                isProjectsActive
                  ? "bg-[#E8873A] text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}>
              <FolderOpen className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">工程项目</span>
              <span onClick={e => { e.stopPropagation(); setProjectListOpen(v => !v); }}
                className="cursor-pointer p-0.5 rounded hover:bg-white/20 transition-colors">
                {projectListOpen
                  ? <ChevronDown className="w-3.5 h-3.5" />
                  : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            </button>

            {/* 项目列表 */}
            {projectListOpen && (
              <div className="mt-1 ml-3 pl-3 border-l border-white/10 flex flex-col gap-0.5">
                {mockProjects.map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      navigate(`/projects/${proj.id}/dashboard`);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer text-left group ${
                      id === proj.id
                        ? "bg-white/15 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/8"
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[proj.status]}`} />
                    <span className="truncate flex-1 leading-snug">{proj.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 项目子菜单 */}
        {id && (
          <div>
            <p className="text-slate-500 text-xs font-medium px-3 mb-1 mt-2 uppercase tracking-wider">项目详情</p>
            {/* 当前项目名称提示 */}
            <div className="mx-3 mb-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#E8873A] flex-shrink-0" />
                <span className="text-white text-xs truncate font-medium">
                  {mockProjects.find(p => p.id === id)?.name || "未知项目"}
                </span>
              </div>
            </div>
            {projectMenuItems.map(({ path, icon: Icon, label }) => (
              <NavLink key={path} to={`/projects/${id}/${path}`} onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer
                  ${isActive
                    ? "bg-[#E8873A] text-white shadow-lg shadow-orange-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                  }
                `}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {path === "analysis" && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-[#E8873A]/20 text-[#E8873A] font-semibold">AI</span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* 底部版本信息 */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-slate-500 text-xs">YOLOv8 / v11 / v26 支持</p>
        <p className="text-slate-600 text-xs mt-0.5">道路病害无人机巡检管理系统 v1.0.0 · 2026</p>
      </div>
    </aside>
  );
}
