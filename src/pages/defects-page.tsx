import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { mockDefects } from "../data/mock-defects";
import { Defect, DefectType, DefectSeverity, DefectStatus } from "../types/index";
import { Search, Plus, Edit2, Trash2, Zap } from "lucide-react";
import DefectDialog from "../components/defects/defect-dialog";
import { useAnalysis } from "../context/analysis-context";

const SEVERITY_STYLE: Record<DefectSeverity, string> = {
  "轻微": "text-green-700 bg-green-50 border-green-200",
  "中等": "text-amber-700 bg-amber-50 border-amber-200",
  "严重": "text-red-700 bg-red-50 border-red-200",
  "极严重": "text-red-900 bg-red-100 border-red-300",
};
const STATUS_STYLE: Record<DefectStatus, string> = {
  "待处理": "text-amber-700 bg-amber-50 border-amber-200",
  "处理中": "text-blue-700 bg-blue-50 border-blue-200",
  "已修复": "text-green-700 bg-green-50 border-green-200",
  "已复查": "text-slate-700 bg-slate-50 border-slate-200",
};

const DEFECT_TYPES: DefectType[] = ["纵向裂缝","横向裂缝","网状裂缝","坑槽","车辙","沉陷","泛油","松散","其他"];
const SEVERITIES: DefectSeverity[] = ["轻微","中等","严重","极严重"];

export default function DefectsPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useAnalysis();

  // 将 AI 识别结果转换为 Defect 格式
  const aiDefects: Defect[] = useMemo(() => {
    const hasAiData = state.allDetectedDefects.length > 0 &&
      (state.projectId === null || state.projectId === id);
    if (!hasAiData) return [];
    return state.allDetectedDefects.map((d, i) => ({
      id: `ai-${d.id}`,
      projectId: id!,
      serialNo: 1000 + i,
      type: d.defectType,
      severity: d.severity,
      status: "待处理" as DefectStatus,
      location: d.location || `图像坐标 (${d.bbox[0]}, ${d.bbox[1]})`,
      description: `AI识别 · 置信度 ${(d.confidence * 100).toFixed(1)}%`,
      imageUrl: d.imageUrl,
      detectedAt: state.analysisTime || new Date().toISOString(),
      updatedAt: state.analysisTime || new Date().toISOString(),
      inspector: "AI自动识别",
      width: d.width,
      length: d.length,
      area: d.area,
    }));
  }, [state.allDetectedDefects, state.projectId, state.analysisTime, id]);

  const baseDefects = mockDefects.filter(d => d.projectId === id);
  const [manualDefects, setManualDefects] = useState<Defect[]>(baseDefects);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<DefectType | "all">("all");
  const [filterSeverity, setFilterSeverity] = useState<DefectSeverity | "all">("all");
  const [filterSource, setFilterSource] = useState<"all" | "ai" | "manual">("all");
  const [editDefect, setEditDefect] = useState<Defect | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // 合并 AI 结果 + 手动录入
  const allDefects = useMemo(() => {
    if (filterSource === "ai") return aiDefects;
    if (filterSource === "manual") return manualDefects;
    return [...aiDefects, ...manualDefects];
  }, [aiDefects, manualDefects, filterSource]);

  const filtered = allDefects.filter(d => {
    const matchSearch = d.location.includes(search) || d.type.includes(search);
    const matchType = filterType === "all" || d.type === filterType;
    const matchSev = filterSeverity === "all" || d.severity === filterSeverity;
    return matchSearch && matchType && matchSev;
  });
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (defectId: string) => {
    if (confirm("确认删除此病害记录？")) {
      setManualDefects(prev => prev.filter(d => d.id !== defectId));
    }
  };

  const handleSave = (updated: Defect) => {
    setManualDefects(prev => prev.map(d => d.id === updated.id ? updated : d));
    setShowDialog(false);
  };

  const isAiDefect = (d: Defect) => d.id.startsWith("ai-");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">病害管理</h1>
          <p className="text-slate-500 text-sm mt-1">
            共 {total} 条病害记录
            {aiDefects.length > 0 && (
              <span className="ml-2 text-green-600 font-medium">
                ⚡ 含 {aiDefects.length} 条 AI 识别结果
              </span>
            )}
          </p>
        </div>
        <button onClick={() => { setEditDefect(null); setShowDialog(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer w-fit"
          style={{ background: "linear-gradient(135deg, #1E3A5F, #2D5F8B)" }}>
          <Plus className="w-4 h-4" /> 新增病害
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="搜索位置或类型…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-slate-50 transition-all" />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value as DefectType | "all"); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 outline-none cursor-pointer bg-white focus:border-[#2D5F8B]">
          <option value="all">全部类型</option>
          {DEFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value as DefectSeverity | "all"); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 outline-none cursor-pointer bg-white focus:border-[#2D5F8B]">
          <option value="all">全部程度</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {aiDefects.length > 0 && (
          <select value={filterSource} onChange={e => { setFilterSource(e.target.value as "all" | "ai" | "manual"); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 outline-none cursor-pointer bg-white focus:border-[#2D5F8B]">
            <option value="all">全部来源</option>
            <option value="ai">⚡ AI识别</option>
            <option value="manual">手动录入</option>
          </select>
        )}
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["序号","来源","病害类型","位置","严重程度","状态","尺寸","操作"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">暂无病害记录</td></tr>
              ) : paginated.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{d.serialNo.toString().padStart(3, "0")}</td>
                  <td className="px-4 py-3">
                    {isAiDefect(d) ? (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-200 font-medium w-fit">
                        <Zap className="w-3 h-3" />AI
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">手动</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1E293B] whitespace-nowrap">{d.type}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{d.location}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${SEVERITY_STYLE[d.severity]}`}>{d.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {d.area ? `${d.area}m²` : ""}
                    {d.length ? ` ${d.length}m` : ""}
                    {d.width ? ` ${d.width}mm` : ""}
                    {!d.area && !d.length && !d.width ? "—" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditDefect(d); setShowDialog(true); }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!isAiDefect(d) && (
                        <button onClick={() => handleDelete(d.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">第 {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,total)} 条，共 {total} 条</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => (
                <button key={i} onClick={() => setPage(i+1)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    page === i+1 ? "bg-[#1E3A5F] text-white" : "text-slate-500 hover:bg-slate-100"
                  }`}>{i+1}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDialog && (
        <DefectDialog defect={editDefect} projectId={id!} onSave={handleSave} onClose={() => setShowDialog(false)} />
      )}
    </div>
  );
}
