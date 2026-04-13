import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAnalysis } from "../context/analysis-context";
import { runAnalysis, MODEL_LABELS } from "../services/ai-model-service";
import { mockImportedImages } from "../data/mock-analysis";
import { mockProjects } from "../data/mock-projects";
import ModelConfigPanel from "../components/analysis/model-config-panel";
import SegmentationCanvas from "../components/analysis/segmentation-canvas";
import SizeStatsTable from "../components/analysis/size-stats-table";
import { AnalyzedImage, DetectedDefect } from "../types/index";
import {
  Play, CheckCircle, FileText, Database, ImageIcon,
  Eye, EyeOff, SquareStack, ArrowLeft, Upload,
  Send, CheckCircle2, CircleDot, RefreshCw
} from "lucide-react";

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, setProjectId, setModelConfig, setAnalyzing, setProgress, setResults, getImportedFiles, isExportedToReport, setExportedToReport } = useAnalysis();

  const project = mockProjects.find(p => p.id === id);

  // 优先使用 ImportPage 传入的真实文件，回退到 mock 数据
  const contextFiles = id ? getImportedFiles(id) : [];
  const imagePool = contextFiles.length > 0
    ? contextFiles
        .filter(f => f.type === "image" && f.status === "done")
        .map(f => ({ id: f.id, name: f.name, url: f.previewUrl || "" }))
    : mockImportedImages;

  // 所选图片
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [showSeg, setShowSeg] = useState(true);
  const [showBBox, setShowBBox] = useState(true);

  const hasResults = state.analyzedImages.length > 0 &&
    (state.projectId === null || state.projectId === id);

  const currentImage: AnalyzedImage | null = hasResults
    ? state.analyzedImages[currentImageIdx] ?? null
    : null;

  const allDefects: DetectedDefect[] = currentImage
    ? currentImage.detectedDefects
    : state.allDetectedDefects;

  const toggleImageSelect = (imgId: string) => {
    setSelectedImageIds(prev =>
      prev.includes(imgId) ? prev.filter(i => i !== imgId) : [...prev, imgId]
    );
  };

  const selectAll = () =>
    setSelectedImageIds(imagePool.map(i => i.id));

  const handleStartAnalysis = async () => {
    if (selectedImageIds.length === 0) {
      alert("请先选择要分析的图像");
      return;
    }
    setProjectId(id!);
    setAnalyzing(true, 0);
    const images = imagePool
      .filter(i => selectedImageIds.includes(i.id))
      .map(i => ({ ...i, width: 800, height: 600 }));

    const results = await runAnalysis(images, state.modelConfig, ({ stage, percent }) => {
      setProgress(percent);
      setProgressMsg(stage);
    });
    setResults(results);
    setCurrentImageIdx(0);
  };

  const handleSaveToDefects = () => {
    alert(`已将 ${state.allDetectedDefects.length} 条识别结果写入病害列表！`);
    navigate(`/projects/${id}/defects`);
  };

  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "done">("idle");
  const exported = id ? isExportedToReport(id) : false;

  const handleExportToReport = () => {
    if (!id || state.allDetectedDefects.length === 0) return;
    setExportStatus("exporting");
    // 模拟短暂的传输过程
    setTimeout(() => {
      setExportedToReport(id);
      setExportStatus("done");
      setTimeout(() => setExportStatus("idle"), 3000);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/projects/${id}/dashboard`)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#1E293B]">AI 病害识别检测</h1>
          <p className="text-slate-400 text-sm truncate">{project?.name}</p>
        </div>
        {hasResults && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleSaveToDefects}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 cursor-pointer shadow-md transition-all"
              style={{ background: "linear-gradient(135deg, #22C55E, #16a34a)" }}>
              <Database className="w-4 h-4" /> 一键入库
            </button>
            <button onClick={handleExportToReport} disabled={exportStatus === "exporting"}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 cursor-pointer shadow-md transition-all ${
                exported
                  ? "bg-green-50 text-green-700 border border-green-300"
                  : exportStatus === "done"
                    ? "bg-green-50 text-green-700 border border-green-300"
                    : "text-white"
              }`}
              style={!exported && exportStatus !== "done"
                ? { background: "linear-gradient(135deg, #3B82F6, #2563EB)" }
                : undefined}>
              {exportStatus === "exporting" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> 导入中…
                </>
              ) : exported ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> 已导入报告
                </>
              ) : exportStatus === "done" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> 导入成功
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> 一键导入报告
                </>
              )}
            </button>
            <button onClick={() => navigate(`/projects/${id}/report`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 cursor-pointer shadow-md transition-all"
              style={{ background: "linear-gradient(135deg, #E8873A, #d97706)" }}>
              <FileText className="w-4 h-4" /> 查看报告
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 左侧面板 */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* 图像选择 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1E293B] text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#2D5F8B]" />
                选择图像 ({selectedImageIds.length}/{imagePool.length})
              </h3>
              <button onClick={selectAll} className="text-xs text-[#2D5F8B] hover:underline cursor-pointer">
                全选
              </button>
            </div>
            {contextFiles.length > 0 ? (
              <div className="mb-2 text-xs text-green-600 bg-green-50 px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                已从影像导入模块加载 {imagePool.length} 张图像
              </div>
            ) : (
              <div className="mb-2 text-xs text-slate-400 bg-slate-50 px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                使用示例图像（可先到影像导入页上传真实图像）
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {imagePool.map(img => (
                <div key={img.id} onClick={() => toggleImageSelect(img.id)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all aspect-square ${
                    selectedImageIds.includes(img.id)
                      ? "border-[#E8873A] shadow-md scale-[0.97]"
                      : "border-transparent hover:border-slate-300"
                  }`}>
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  {selectedImageIds.includes(img.id) && (
                    <div className="absolute inset-0 bg-[#E8873A]/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-[#E8873A]" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 truncate">
                    {img.name.split("_").pop()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 模型配置 */}
          <ModelConfigPanel config={state.modelConfig} onChange={setModelConfig} />

          {/* 启动按钮 */}
          <button onClick={handleStartAnalysis} disabled={state.isAnalyzing || selectedImageIds.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ background: state.isAnalyzing ? "#64748B" : "linear-gradient(135deg, #1E3A5F, #E8873A)" }}>
            {state.isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {progressMsg || "识别中…"}
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                开始 AI 识别检测
              </>
            )}
          </button>

          {/* 进度条 */}
          {state.isAnalyzing && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>{progressMsg}</span>
                <span>{state.progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${state.progress}%`, background: "linear-gradient(90deg, #1E3A5F, #E8873A)" }} />
              </div>
            </div>
          )}
        </div>

        {/* 右侧可视化区 */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* 识别结果可视化 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h3 className="font-semibold text-[#1E293B] text-sm">识别结果可视化</h3>
              {hasResults && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSeg(!showSeg)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      showSeg ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-100 text-slate-500"
                    }`}>
                    {showSeg ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    分割掩码
                  </button>
                  <button onClick={() => setShowBBox(!showBBox)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      showBBox ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-slate-100 text-slate-500"
                    }`}>
                    {showBBox ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    检测框
                  </button>
                </div>
              )}
            </div>

            {/* Canvas 区域 */}
            <div className="p-4 bg-slate-900 min-h-64 flex items-center justify-center">
              {!hasResults ? (
                <div className="text-center text-slate-500">
                  <SquareStack className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">选择图像并启动识别后，结果将在此展示</p>
                  <p className="text-xs mt-1 opacity-60">支持像素级分割掩码叠加和 BBox 检测框标注</p>
                </div>
              ) : currentImage ? (
                <SegmentationCanvas
                  imageUrl={currentImage.url}
                  imageWidth={currentImage.width}
                  imageHeight={currentImage.height}
                  defects={currentImage.detectedDefects}
                  showSegmentation={showSeg}
                  showBBox={showBBox}
                />
              ) : null}
            </div>

            {/* 图片切换 */}
            {hasResults && state.analyzedImages.length > 1 && (
              <div className="flex gap-2 px-4 py-3 border-t border-slate-100 overflow-x-auto">
                {state.analyzedImages.map((img, idx) => (
                  <button key={img.id} onClick={() => setCurrentImageIdx(idx)}
                    className={`flex-shrink-0 rounded-lg overflow-hidden border-2 w-14 h-14 transition-all cursor-pointer ${
                      idx === currentImageIdx ? "border-[#E8873A]" : "border-transparent opacity-60 hover:opacity-100"
                    }`}>
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 尺寸统计表 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-[#1E293B] text-sm">病害尺寸统计</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentImage
                    ? `当前图像 ${currentImage.name} · ${currentImage.detectedDefects.length} 处病害`
                    : `全部图像 · ${state.allDetectedDefects.length} 处病害`}
                </p>
              </div>
              {hasResults && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                  {MODEL_LABELS[state.modelConfig.modelType]}
                </span>
              )}
            </div>
            <div className="p-4">
              <SizeStatsTable defects={allDefects} gsd={state.modelConfig.gsd} />
            </div>
          </div>

          {/* 报告导入状态卡片 */}
          {hasResults && (
            <div className={`rounded-2xl border p-5 transition-all ${
              exported
                ? "bg-green-50/60 border-green-200"
                : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  exported ? "bg-green-100" : "bg-blue-100"
                }`}>
                  {exported
                    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                    : <CircleDot className="w-5 h-5 text-blue-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1E293B] text-sm">检测报告数据同步</h3>
                    {exported ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">
                        已同步
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
                        待同步
                      </span>
                    )}
                  </div>
                  {exported ? (
                    <div className="text-xs text-green-600 leading-relaxed">
                      识别结果已成功导入「检测报告」模块，包含{" "}
                      <span className="font-semibold">{state.allDetectedDefects.length}</span>{" "}
                      条病害数据、{" "}
                      <span className="font-semibold">{state.analyzedImages.length}</span>{" "}
                      张分析图像。可前往报告页查看或导出 PDF。
                      {state.exportedToReport[id!] && (
                        <span className="block mt-1 text-green-500 font-mono">
                          导入时间：{new Date(state.exportedToReport[id!]).toLocaleString("zh-CN")}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 leading-relaxed">
                      当前识别结果尚未同步至检测报告。点击上方「一键导入报告」按钮，
                      可将 <span className="font-semibold text-[#1E293B]">{state.allDetectedDefects.length}</span> 条病害数据
                      与 <span className="font-semibold text-[#1E293B]">{state.analyzedImages.length}</span> 张图像分析结果
                      一次性同步至报告模块。
                    </div>
                  )}
                </div>
                {!exported && (
                  <button onClick={handleExportToReport} disabled={exportStatus === "exporting"}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 cursor-pointer shadow-md transition-all flex-shrink-0 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>
                    {exportStatus === "exporting" ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> 导入中…</>
                    ) : (
                      <><Send className="w-4 h-4" /> 一键导入</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
