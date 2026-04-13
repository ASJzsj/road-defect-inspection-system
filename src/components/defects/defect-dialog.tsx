import { useState } from "react";
import { Defect, DefectType, DefectSeverity, DefectStatus } from "../../types/index";
import { X, Save } from "lucide-react";

interface Props {
  defect: Defect | null;
  projectId: string;
  onSave: (d: Defect) => void;
  onClose: () => void;
}

const DEFECT_TYPES: DefectType[] = ["纵向裂缝","横向裂缝","网状裂缝","坑槽","车辙","沉陷","泛油","松散","其他"];
const SEVERITIES: DefectSeverity[] = ["轻微","中等","严重","极严重"];
const STATUSES: DefectStatus[] = ["待处理","处理中","已修复","已复查"];

export default function DefectDialog({ defect, projectId, onSave, onClose }: Props) {
  const isNew = !defect;
  const [form, setForm] = useState<Partial<Defect>>(defect || {
    projectId,
    type: "纵向裂缝",
    severity: "中等",
    status: "待处理",
    location: "",
    description: "",
    inspector: "",
    detectedAt: new Date().toISOString().slice(0,10),
    updatedAt: new Date().toISOString(),
  });

  const update = (key: keyof Defect, val: string | number) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.location || !form.type) return;
    onSave({
      ...form,
      id: defect?.id || `d-${Date.now()}`,
      serialNo: defect?.serialNo || Date.now(),
      updatedAt: new Date().toISOString(),
    } as Defect);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 弹窗头 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-[#1E293B]">{isNew ? "新增病害" : "编辑病害"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 表单 */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="病害类型 *">
            <select value={form.type} onChange={e => update("type", e.target.value as DefectType)}
              className="form-select w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white cursor-pointer">
              {DEFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="严重程度 *">
            <select value={form.severity} onChange={e => update("severity", e.target.value as DefectSeverity)}
              className="form-select w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white cursor-pointer">
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="处理状态">
            <select value={form.status} onChange={e => update("status", e.target.value as DefectStatus)}
              className="form-select w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white cursor-pointer">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="负责人">
            <input type="text" value={form.inspector || ""} onChange={e => update("inspector", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white" />
          </Field>
          <Field label="位置 *" className="sm:col-span-2">
            <input type="text" value={form.location || ""} onChange={e => update("location", e.target.value)}
              placeholder="如：K12+340 或 解放路与中山路交叉口"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white" />
          </Field>
          <Field label="裂缝宽度 (mm)">
            <input type="number" value={form.width || ""} onChange={e => update("width", +e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white" />
          </Field>
          <Field label="裂缝长度 (m)">
            <input type="number" value={form.length || ""} onChange={e => update("length", +e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white" />
          </Field>
          <Field label="面积 (m²)">
            <input type="number" value={form.area || ""} onChange={e => update("area", +e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white" />
          </Field>
          <Field label="检测日期">
            <input type="date" value={(form.detectedAt || "").slice(0,10)} onChange={e => update("detectedAt", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white cursor-pointer" />
          </Field>
          <Field label="病害描述" className="sm:col-span-2">
            <textarea value={form.description || ""} onChange={e => update("description", e.target.value)}
              rows={3} placeholder="描述病害的具体情况、成因分析等…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white resize-none" />
          </Field>
          <Field label="修复建议" className="sm:col-span-2">
            <textarea value={form.repairMethod || ""} onChange={e => update("repairMethod", e.target.value)}
              rows={2} placeholder="建议的修复方法…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-white resize-none" />
          </Field>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            取消
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm text-white font-medium shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ background: "linear-gradient(135deg, #1E3A5F, #2D5F8B)" }}>
            <Save className="w-4 h-4" /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
