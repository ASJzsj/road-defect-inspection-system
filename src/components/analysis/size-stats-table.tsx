import { DetectedDefect } from "../../types/index";
import { DEFECT_BBOX_COLORS } from "../../services/ai-model-service";
import { Ruler, Square, Maximize2 } from "lucide-react";

interface Props {
  defects: DetectedDefect[];
  gsd: number;
}

export default function SizeStatsTable({ defects, gsd }: Props) {
  if (defects.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        <Ruler className="w-8 h-8 mx-auto mb-2 opacity-40" />
        暂无检测结果，请先运行 AI 识别
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {["编号","病害类型","置信度","严重程度","像素面积","实际面积","长度","宽度"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {defects.map((d, i) => {
            const color = DEFECT_BBOX_COLORS[d.defectType] || "#64748B";
            return (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2 text-slate-400 font-mono">{String(i+1).padStart(2,"0")}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="font-medium text-[#1E293B] whitespace-nowrap">{d.defectType}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-12">
                      <div className="h-full rounded-full"
                        style={{ width: `${d.confidence*100}%`, background: d.confidence > 0.85 ? "#22C55E" : d.confidence > 0.7 ? "#F59E0B" : "#EF4444" }} />
                    </div>
                    <span className="text-slate-600">{(d.confidence*100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    d.severity === "极严重" ? "bg-red-100 text-red-700" :
                    d.severity === "严重" ? "bg-orange-100 text-orange-700" :
                    d.severity === "中等" ? "bg-amber-100 text-amber-700" :
                    "bg-green-100 text-green-700"
                  }`}>{d.severity}</span>
                </td>
                <td className="px-3 py-2 text-slate-500 font-mono">
                  {d.pixelArea ? `${d.pixelArea.toLocaleString()} px²` : "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1 text-[#1E293B]">
                    <Square className="w-3 h-3 text-slate-400" />
                    <span className="font-medium">{d.area ? `${d.area.toFixed(2)} m²` : "—"}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1 text-[#1E293B]">
                    <Maximize2 className="w-3 h-3 text-slate-400" />
                    <span className="font-medium">{d.length ? `${d.length.toFixed(1)} m` : "—"}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-[#1E293B] font-medium">
                  {d.width ? `${d.width} mm` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 border-t border-slate-200">
            <td colSpan={4} className="px-3 py-2 text-slate-500 text-xs font-medium">
              合计 {defects.length} 处病害 · GSD = {gsd} cm/px
            </td>
            <td className="px-3 py-2 text-slate-500 font-mono text-xs">
              {defects.reduce((s, d) => s + (d.pixelArea || 0), 0).toLocaleString()} px²
            </td>
            <td className="px-3 py-2 text-[#1E293B] font-semibold text-xs">
              {defects.reduce((s, d) => s + (d.area || 0), 0).toFixed(2)} m²
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
