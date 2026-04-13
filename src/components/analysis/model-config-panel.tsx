import { useState } from "react";
import { ModelConfig, YoloModelType } from "../../types/index";
import { MODEL_LABELS } from "../../services/ai-model-service";
import { Settings, Cpu, ChevronDown, ChevronUp, Sliders, X, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";

interface Props {
  config: ModelConfig;
  onChange: (config: ModelConfig) => void;
}

// 模型分组
const MODEL_GROUPS: Array<{
  label: string;
  badge?: string;
  badgeColor?: string;
  models: YoloModelType[];
}> = [
  {
    label: "YOLOv8 系列",
    models: ["yolov8-detect", "yolov8-seg"],
  },
  {
    label: "YOLOv11 系列",
    models: ["yolov11-detect", "yolov11-seg"],
  },
  {
    label: "YOLOv26 系列",
    badge: "NEW",
    badgeColor: "bg-green-100 text-green-700",
    models: ["yolov26-detect", "yolov26-seg"],
  },
  {
    label: "自定义模型",
    models: ["custom"],
  },
];

const MODEL_DESC: Record<YoloModelType, string> = {
  "yolov8-detect":  "BBox + 类别 + 置信度",
  "yolov8-seg":     "BBox + 像素级分割掩码",
  "yolov11-detect": "BBox + 类别 + 置信度（增强版）",
  "yolov11-seg":    "BBox + 像素级分割（增强版）",
  "yolov26-detect": "BBox + 多尺度检测（最新架构）",
  "yolov26-seg":    "BBox + 精细分割（最新架构）",
  "custom":         "配置自定义模型端点与参数",
};

export default function ModelConfigPanel({ config, onChange }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [localCustom, setLocalCustom] = useState({
    customModelName: config.customModelName || "",
    customModelVersion: config.customModelVersion || "latest",
    customInputSize: config.customInputSize || 640,
    customClasses: config.customClasses || "纵向裂缝,横向裂缝,网状裂缝,坑槽,车辙,沉陷,泛油,松散",
  });

  const update = (key: keyof ModelConfig, val: string | number | boolean) =>
    onChange({ ...config, [key]: val });

  const handleModelSelect = (m: YoloModelType) => {
    onChange({ ...config, modelType: m });
    if (m === "custom") {
      setShowCustomDialog(true);
    }
  };

  const handleSaveCustom = () => {
    onChange({ ...config, modelType: "custom", ...localCustom });
    setShowCustomDialog(false);
  };

  const isMock = config.useMock !== false;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#2D5F8B]" />
            <span className="font-semibold text-[#1E293B] text-sm">模型配置</span>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md ml-1">
              {MODEL_LABELS[config.modelType]}
            </span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded && (
          <div className="px-5 pb-5 flex flex-col gap-4 border-t border-slate-100">
            {/* 模型选择 */}
            <div className="flex flex-col gap-2 pt-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">检测模型</label>
              {MODEL_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400 font-medium">{group.label}</span>
                    {group.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${group.badgeColor}`}>
                        {group.badge}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mb-2">
                    {group.models.map(m => (
                      <button key={m} onClick={() => handleModelSelect(m)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                          config.modelType === m
                            ? "border-[#E8873A] bg-orange-50 text-[#1E293B]"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}>
                        <Cpu className={`w-4 h-4 flex-shrink-0 ${config.modelType === m ? "text-[#E8873A]" : "text-slate-400"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs leading-tight">{MODEL_LABELS[m]}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{MODEL_DESC[m]}</div>
                        </div>
                        {m === "custom" && config.modelType === "custom" && config.customModelName && (
                          <span className="text-[10px] text-[#E8873A] font-mono truncate max-w-[80px]">{config.customModelName}</span>
                        )}
                        {m === "custom" && (
                          <button
                            onClick={e => { e.stopPropagation(); handleModelSelect("custom"); setShowCustomDialog(true); }}
                            className="p-1 rounded hover:bg-orange-100 text-slate-400 hover:text-[#E8873A] cursor-pointer transition-colors"
                            title="配置自定义模型">
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {config.modelType === m && m !== "custom" && (
                          <div className="w-2 h-2 rounded-full bg-[#E8873A] flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mock / 真实 API 切换 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">运行模式</label>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <button onClick={() => update("useMock", !isMock)}
                  className="cursor-pointer flex-shrink-0">
                  {isMock
                    ? <ToggleLeft className="w-8 h-8 text-slate-400" />
                    : <ToggleRight className="w-8 h-8 text-[#E8873A]" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#1E293B]">
                    {isMock ? "使用 Mock 数据（演示模式）" : "调用真实 YOLO API"}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {isMock ? "内置模拟识别数据，无需 API 服务" : "向下方 API 端点发送真实请求"}
                  </div>
                </div>
                {!isMock && (
                  <span className="text-[10px] text-green-700 bg-green-50 px-2 py-1 rounded-lg border border-green-200 font-medium">在线</span>
                )}
              </div>
            </div>

            {/* API 端点 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                API 端点
                {!isMock && <span className="normal-case text-green-600 font-normal">（已启用）</span>}
              </label>
              <input type="text" value={config.apiEndpoint}
                onChange={e => update("apiEndpoint", e.target.value)}
                placeholder="http://localhost:8000/api/v1/detect"
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#2D5F8B] font-mono ${
                  isMock ? "bg-slate-50 border-slate-200 text-slate-400" : "bg-white border-[#2D5F8B] text-[#1E293B]"
                }`} />
              {config.apiKey !== undefined && (
                <input type="password" value={config.apiKey}
                  onChange={e => update("apiKey", e.target.value)}
                  placeholder="API Key（可选）"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] bg-slate-50" />
              )}
              {isMock && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Mock 模式下不发送请求。切换为在线模式后将使用此端点
                </p>
              )}
            </div>

            {/* GSD 参数 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                GSD 地面采样距离 (cm/px)
              </label>
              <div className="flex items-center gap-3">
                <input type="range" min={0.5} max={10} step={0.5} value={config.gsd}
                  onChange={e => update("gsd", +e.target.value)}
                  className="flex-1 accent-[#E8873A] cursor-pointer" />
                <span className="w-14 text-center text-sm font-semibold text-[#1E293B] bg-slate-100 rounded-lg py-1">
                  {config.gsd} cm
                </span>
              </div>
              <p className="text-xs text-slate-400">影响实际尺寸换算精度，建议参考无人机飞行高度设置</p>
            </div>

            {/* 置信度阈值 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                置信度阈值: {config.confidenceThreshold}
              </label>
              <input type="range" min={0.1} max={0.95} step={0.05} value={config.confidenceThreshold}
                onChange={e => update("confidenceThreshold", +e.target.value)}
                className="w-full accent-[#2D5F8B] cursor-pointer" />
            </div>
          </div>
        )}
      </div>

      {/* 自定义模型配置弹窗 */}
      {showCustomDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"
              style={{ background: "linear-gradient(135deg, #1E3A5F, #2D5F8B)" }}>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#E8873A]" />
                <span className="text-white font-semibold">自定义模型配置</span>
              </div>
              <button onClick={() => setShowCustomDialog(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 text-white cursor-pointer transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">模型名称 *</label>
                <input type="text" value={localCustom.customModelName}
                  onChange={e => setLocalCustom(v => ({ ...v, customModelName: e.target.value }))}
                  placeholder="例如：road_defect_v2"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] focus:ring-2 focus:ring-[#2D5F8B]/10" />
                <p className="text-xs text-slate-400">与 API 服务端注册的模型名称保持一致</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">模型版本</label>
                <input type="text" value={localCustom.customModelVersion}
                  onChange={e => setLocalCustom(v => ({ ...v, customModelVersion: e.target.value }))}
                  placeholder="latest"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D5F8B]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">输入尺寸 (px)</label>
                <select value={localCustom.customInputSize}
                  onChange={e => setLocalCustom(v => ({ ...v, customInputSize: +e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] cursor-pointer bg-white">
                  {[320, 416, 512, 640, 768, 1024, 1280].map(s => (
                    <option key={s} value={s}>{s} × {s}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">识别类别（逗号分隔）</label>
                <textarea value={localCustom.customClasses}
                  onChange={e => setLocalCustom(v => ({ ...v, customClasses: e.target.value }))}
                  rows={3}
                  placeholder="纵向裂缝,横向裂缝,网状裂缝,坑槽,车辙..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2D5F8B] resize-none font-mono" />
                <p className="text-xs text-slate-400">与模型训练时的类别名称保持一致</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 leading-relaxed">
                  ⚠️ 自定义模型需配合真实 API 端点使用。请确保服务端支持 POST JSON 格式（<code className="font-mono">image</code> + <code className="font-mono">model_name</code> 字段），并在上方开启"在线模式"。
                </p>
              </div>
            </div>

            {/* 弹窗操作 */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setShowCustomDialog(false)}
                className="px-5 py-2.5 rounded-xl text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                取消
              </button>
              <button onClick={handleSaveCustom}
                disabled={!localCustom.customModelName.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:opacity-90 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #E8873A, #d97706)" }}>
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
