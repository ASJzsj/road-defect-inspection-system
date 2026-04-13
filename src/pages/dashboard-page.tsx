import { useNavigate, useParams } from "react-router-dom";
import { mockProjects, mockMonthlyTrend } from "../data/mock-projects";
import { defectTypeDistribution, severityDistribution } from "../data/mock-defects";
import { useAnalysis } from "../context/analysis-context";
import { DEFECT_BBOX_COLORS } from "../services/ai-model-service";
import { ArrowLeft, Bug, AlertTriangle, CheckCircle, Flame, TrendingUp, Zap } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = mockProjects.find(p => p.id === id);
  const { state } = useAnalysis();

  if (!project) return <div className="text-center py-20 text-slate-400">项目不存在</div>;

  // 是否有当前项目的 AI 识别结果
  const hasAnalysisData = state.allDetectedDefects.length > 0 &&
    (state.projectId === null || state.projectId === id);

  // 动态数据：优先 AnalysisContext，无则回退 mock
  const totalDefects = hasAnalysisData ? state.allDetectedDefects.length : project.defectCount;
  const severeCount = hasAnalysisData
    ? state.allDetectedDefects.filter(d => d.severity === "严重" || d.severity === "极严重").length
    : project.severeCount;
  const pendingCount = hasAnalysisData
    ? state.allDetectedDefects.filter(d => d.severity !== "轻微").length
    : project.pendingCount;

  const stats = [
    { label: "总病害数", value: totalDefects, icon: Bug, color: "#3B82F6", bg: "bg-blue-50", trend: hasAnalysisData ? "AI实时" : "+5" },
    { label: "待处理", value: pendingCount, icon: AlertTriangle, color: "#F59E0B", bg: "bg-amber-50", trend: hasAnalysisData ? "AI实时" : "-2" },
    { label: "已修复", value: project.fixedCount, icon: CheckCircle, color: "#22C55E", bg: "bg-green-50", trend: "+8" },
    { label: "严重病害", value: severeCount, icon: Flame, color: "#EF4444", bg: "bg-red-50", trend: hasAnalysisData ? "AI实时" : "+1" },
  ];

  // 类型分布：优先 AnalysisContext
  const typeDistData = hasAnalysisData
    ? (() => {
        const map: Record<string, number> = {};
        state.allDetectedDefects.forEach(d => {
          map[d.defectType] = (map[d.defectType] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({
          name, value, color: DEFECT_BBOX_COLORS[name] || "#64748B"
        }));
      })()
    : defectTypeDistribution;

  // 严重程度分布：优先 AnalysisContext
  const SEVERITY_COLORS: Record<string, string> = {
    "轻微": "#22C55E", "中等": "#F59E0B", "严重": "#EF4444", "极严重": "#7F1D1D"
  };
  const sevDistData = hasAnalysisData
    ? (() => {
        const map: Record<string, number> = {};
        state.allDetectedDefects.forEach(d => {
          map[d.severity] = (map[d.severity] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({
          name, value, color: SEVERITY_COLORS[name] || "#64748B"
        }));
      })()
    : severityDistribution;

  return (
    <div className="max-w-7xl mx-auto">
      {/* 顶部标题 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/projects")}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#1E293B] line-clamp-1">{project.name}</h1>
          <p className="text-slate-400 text-sm">{project.location} · {project.roadType}</p>
        </div>
        {hasAnalysisData && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-green-700 bg-green-50 border border-green-200">
            <Zap className="w-3.5 h-3.5" />
            已加载 AI 识别数据 · {state.allDetectedDefects.length} 处病害
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                trend === "AI实时" ? "text-green-700 bg-green-50 border border-green-200"
                : trend.startsWith("+") ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
              }`}>{trend === "AI实时" ? "⚡ AI实时" : `${trend} 本月`}</span>
            </div>
            <div className="text-3xl font-bold text-[#1E293B]">{value}</div>
            <div className="text-slate-400 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* 病害类型饼图 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-[#1E293B] mb-1">病害类型分布</h3>
          {hasAnalysisData && <p className="text-xs text-green-600 mb-3">⚡ 来自 AI 识别结果</p>}
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={typeDistData} cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                dataKey="value" paddingAngle={3}>
                {typeDistData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}处`, "数量"]} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 严重程度柱状图 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-[#1E293B] mb-1">严重程度分布</h3>
          {hasAnalysisData && <p className="text-xs text-green-600 mb-3">⚡ 来自 AI 识别结果</p>}
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sevDistData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
              <Tooltip formatter={(v: number) => [`${v}处`, "数量"]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {sevDistData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 趋势折线图 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#2D5F8B]" />
          <h3 className="font-semibold text-[#1E293B]">近6个月病害趋势</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={mockMonthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} name="发现病害" />
            <Line type="monotone" dataKey="fixed" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4 }} name="已修复" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
