import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockProjects } from "../data/mock-projects";
import { Project, ProjectStatus } from "../types/index";
import {
  Search, Plus, MapPin, Calendar, Bug, AlertTriangle,
  CheckCircle, Clock, Archive, ChevronRight, LayoutGrid, List
} from "lucide-react";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{className?:string}> }> = {
  active:    { label: "进行中", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   icon: Clock },
  completed: { label: "已完成", color: "text-green-700",  bg: "bg-green-50 border-green-200",  icon: CheckCircle },
  pending:   { label: "待开始", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",  icon: AlertTriangle },
  archived:  { label: "已归档", color: "text-slate-600",  bg: "bg-slate-50 border-slate-200",  icon: Archive },
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">("all");

  const filtered = mockProjects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.includes(search);
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">工程项目</h1>
          <p className="text-slate-500 text-sm mt-1">共 {mockProjects.length} 个巡检项目</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer w-fit"
          style={{ background: "linear-gradient(135deg, #1E3A5F, #2D5F8B)" }}>
          <Plus className="w-4 h-4" />
          新建项目
        </button>
      </div>

      {/* 搜索 & 筛选 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索项目名称或地点…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#2D5F8B] focus:ring-2 focus:ring-[#2D5F8B]/10 bg-white transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "active", "completed", "pending", "archived"] as const).map(s => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                filterStatus === s
                  ? "bg-[#1E3A5F] text-white border-[#1E3A5F]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#1E3A5F]/50"
              }`}>
              {s === "all" ? "全部" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* 项目网格 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Bug className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>未找到匹配的项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}/dashboard`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const cfg = STATUS_CONFIG[project.status];
  const Icon = cfg.icon;

  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#2D5F8B]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
      {/* 封面图 */}
      <div className="relative h-36 overflow-hidden">
        <img src={project.coverImage || "https://placehold.co/400x200/1E3A5F/FFFFFF?text=Road+Inspection"}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-md">{project.roadType}</span>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4">
        <h3 className="font-semibold text-[#1E293B] text-sm leading-snug mb-2 line-clamp-2">{project.name}</h3>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{project.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{project.startDate}{project.endDate ? ` ~ ${project.endDate}` : ""}</span>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatPill label="总病害" value={project.defectCount} color="text-slate-700" />
          <StatPill label="待处理" value={project.pendingCount} color="text-amber-600" />
          <StatPill label="严重" value={project.severeCount} color="text-red-600" />
        </div>

        {/* 修复进度 */}
        {project.defectCount > 0 && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>修复进度</span>
              <span>{Math.round(project.fixedCount / project.defectCount * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round(project.fixedCount / project.defectCount * 100)}%`,
                  background: "linear-gradient(90deg, #22C55E, #16a34a)"
                }} />
            </div>
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">负责人：{project.inspector}</span>
        <div className="flex items-center gap-1 text-[#2D5F8B] text-xs font-medium group-hover:gap-2 transition-all">
          查看详情 <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-50 rounded-lg px-2 py-2 text-center">
      <div className={`text-base font-bold ${color}`}>{value}</div>
      <div className="text-slate-400 text-xs">{label}</div>
    </div>
  );
}
