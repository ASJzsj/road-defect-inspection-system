import { useParams, useNavigate } from "react-router-dom";
import { useAnalysis } from "../context/analysis-context";
import { useAuth } from "../context/auth-context";
import { mockProjects } from "../data/mock-projects";
import { MODEL_LABELS, DEFECT_BBOX_COLORS } from "../services/ai-model-service";
import { DetectedDefect } from "../types/index";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Printer, ArrowLeft, FileText, AlertTriangle, MapPin, Ruler, CheckCircle2, CircleDot } from "lucide-react";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, isExportedToReport } = useAnalysis();
  const { user } = useAuth();
  const project = mockProjects.find(p => p.id === id);

  const hasData = state.allDetectedDefects.length > 0;

  // 统计
  const typeMap: Record<string, number> = {};
  const severityMap: Record<string, number> = {};
  state.allDetectedDefects.forEach(d => {
    typeMap[d.defectType] = (typeMap[d.defectType] || 0) + 1;
    severityMap[d.severity] = (severityMap[d.severity] || 0) + 1;
  });
  const typePieData = Object.entries(typeMap).map(([name, value]) => ({
    name, value, color: DEFECT_BBOX_COLORS[name] || "#64748B"
  }));
  const reportId = `RPT-${id?.slice(-3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

  return (
    <div className="max-w-4xl mx-auto print-container">
      {/* 操作栏（打印时隐藏）*/}
      <div className="flex items-center gap-3 mb-6 no-print">
        <button onClick={() => navigate(`/projects/${id}/analysis`)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#1E293B]">检测结果报告</h1>
          <p className="text-slate-400 text-sm">
            {id && isExportedToReport(id)
              ? "已同步 AI 识别结果"
              : "实时读取 AI 识别结果"}
          </p>
        </div>
        {id && isExportedToReport(id) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-700">数据已从 AI 识别导入</span>
          </div>
        )}
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 cursor-pointer active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg, #1E3A5F, #2D5F8B)" }}>
          <Printer className="w-4 h-4" />
          打印 / 导出 PDF
        </button>
      </div>

      {/* 报告主体 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden report-body">
        {/* 报告头部 */}
        <div className="px-8 py-6 border-b-4 report-header" style={{ borderColor: "#1E3A5F" }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "#1E3A5F" }}>
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-[#1E3A5F] font-bold text-sm uppercase tracking-widest">道路病害检测报告</span>
              </div>
              <h2 className="text-xl font-bold text-[#1E293B] mb-1">{project?.name || "未知项目"}</h2>
              <p className="text-slate-500 text-sm">{project?.location} · {project?.roadType}</p>
            </div>
            <div className="text-right text-xs text-slate-400 leading-relaxed">
              <p className="font-mono font-bold text-slate-600 text-sm">{reportId}</p>
              <p className="mt-1">检测时间：{state.analysisTime ? new Date(state.analysisTime).toLocaleString("zh-CN") : "—"}</p>
              <p>使用模型：{MODEL_LABELS[state.modelConfig.modelType]}</p>
              <p>GSD 参数：{state.modelConfig.gsd} cm/px</p>
              <p>操作人员：{user?.displayName || "—"}</p>
              {id && state.exportedToReport[id] && (
                <p className="mt-1 text-green-600">报告导入：{new Date(state.exportedToReport[id]).toLocaleString("zh-CN")}</p>
              )}
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="py-20 text-center text-slate-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无识别结果，请先在 AI 识别检测页运行检测</p>
            <button onClick={() => navigate(`/projects/${id}/analysis`)}
              className="mt-4 px-5 py-2 rounded-xl text-sm text-white cursor-pointer"
              style={{ background: "#1E3A5F" }}>
              前往识别
            </button>
          </div>
        ) : (
          <>
            {/* 汇总统计 */}
            <div className="px-8 py-6 border-b border-slate-100 report-section">
              <h3 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#1E3A5F" }}>一</span>
                病害汇总统计
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 report-stat-cards">
                {[
                  { label: "检测图像数", value: state.analyzedImages.length, color: "#3B82F6" },
                  { label: "总病害数", value: state.allDetectedDefects.length, color: "#EF4444" },
                  { label: "严重及以上", value: state.allDetectedDefects.filter(d => d.severity === "严重" || d.severity === "极严重").length, color: "#F97316" },
                  { label: "总面积", value: `${state.allDetectedDefects.reduce((s,d) => s+(d.area||0), 0).toFixed(2)} m²`, color: "#8B5CF6" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-4 border" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                    <div className="text-slate-500 text-sm mt-1">{label}</div>
                  </div>
                ))}
              </div>

              {/* 类型分布 & 饼图 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 report-chart">
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-3">病害类型分布</h4>
                  <div className="flex flex-col gap-2">
                    {Object.entries(typeMap).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DEFECT_BBOX_COLORS[type] }} />
                        <span className="text-sm text-slate-600 flex-1">{type}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-2">
                          <div className="h-full rounded-full" style={{
                            width: `${count / state.allDetectedDefects.length * 100}%`,
                            background: DEFECT_BBOX_COLORS[type]
                          }} />
                        </div>
                        <span className="text-sm font-medium text-[#1E293B] w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-3">类型分布图</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={typePieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" paddingAngle={2}>
                        {typePieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v} 处`, ""]} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 病害详情列表 */}
            <div className="px-8 py-6 report-section">
              <h3 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#1E3A5F" }}>二</span>
                病害详情清单
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden report-table">
                  <thead>
                    <tr style={{ background: "#1E3A5F" }}>
                      {["序号","病害类型","严重程度","置信度","像素面积","实际面积","长度","宽度","位置"].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-white font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.allDetectedDefects.map((d, i) => (
                      <tr key={d.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        <td className="px-3 py-2 text-slate-400 font-mono">{String(i+1).padStart(2,"0")}</td>
                        <td className="px-3 py-2 font-medium text-[#1E293B] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: DEFECT_BBOX_COLORS[d.defectType] }} />
                            {d.defectType}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            d.severity === "极严重" ? "bg-red-100 text-red-700" :
                            d.severity === "严重" ? "bg-orange-100 text-orange-700" :
                            d.severity === "中等" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                          }`}>{d.severity}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{(d.confidence * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2 text-slate-500 font-mono">{d.pixelArea?.toLocaleString() ?? "—"} px²</td>
                        <td className="px-3 py-2 font-medium text-[#1E293B]">{d.area?.toFixed(2) ?? "—"} m²</td>
                        <td className="px-3 py-2 text-[#1E293B]">{d.length ? `${d.length.toFixed(1)} m` : "—"}</td>
                        <td className="px-3 py-2 text-[#1E293B]">{d.width ? `${d.width} mm` : "—"}</td>
                        <td className="px-3 py-2 text-slate-500 max-w-[120px] truncate">{d.location || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 报告签署区 */}
              <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-8 text-center report-signatures">
                {["检测负责人", "审核人", "批准人"].map(role => (
                  <div key={role}>
                    <div className="h-12 border-b border-slate-300 mb-2" />
                    <p className="text-xs text-slate-400">{role}</p>
                    <p className="text-xs text-slate-300 mt-1">日期：__________</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-slate-300 text-xs mt-4">
              本报告由道路病害无人机巡检管理系统 v1.0.0 自动生成 · {new Date().toLocaleDateString("zh-CN")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
