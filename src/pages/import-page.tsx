import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, X, Film, Image, CheckCircle, AlertCircle, ScanLine, ArrowRight } from "lucide-react";
import { ImportedFile } from "../types/index";
import { useAnalysis } from "../context/analysis-context";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ImportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addImportedFiles } = useAnalysis();
  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [sentToAnalysis, setSentToAnalysis] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (rawFiles: FileList | null) => {
    if (!rawFiles) return;
    const accepted = ["image/jpeg","image/png","image/webp","video/mp4","video/mov","video/avi"];
    Array.from(rawFiles).forEach(f => {
      if (!accepted.includes(f.type)) return;
      const fileType = f.type.startsWith("video/") ? "video" : "image";
      const imported: ImportedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: f.size,
        type: fileType,
        status: "uploading",
        progress: 0,
        previewUrl: fileType === "image" ? URL.createObjectURL(f) : undefined,
        uploadedAt: new Date().toISOString(),
        projectId: id!,
      };
      setFiles(prev => [...prev, imported]);

      // 模拟上传进度
      let progress = 0;
      const timer = setInterval(() => {
        progress += Math.random() * 20 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(timer);
          setFiles(prev => prev.map(fi => fi.id === imported.id ? { ...fi, progress: 100, status: "done" } : fi));
        } else {
          setFiles(prev => prev.map(fi => fi.id === imported.id ? { ...fi, progress: Math.round(progress) } : fi));
        }
      }, 200);
    });
    setSentToAnalysis(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) =>
    setFiles(prev => prev.filter(f => f.id !== fileId));

  const doneFiles = files.filter(f => f.status === "done");
  const doneCount = doneFiles.length;

  // 批量确认导入：写入 AnalysisContext，跳转 AI 识别页
  const handleConfirmImport = () => {
    if (doneCount === 0) return;
    addImportedFiles(doneFiles);
    setSentToAnalysis(true);
  };

  const handleGoToAnalysis = () => {
    addImportedFiles(doneFiles);
    navigate(`/projects/${id}/analysis`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">影像导入</h1>
        <p className="text-slate-500 text-sm mt-1">上传无人机拍摄的图片或视频，用于 AI 病害识别分析</p>
      </div>

      {/* 拖拽上传区 */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 mb-6 ${
          isDragging
            ? "border-[#E8873A] bg-orange-50 scale-[1.01]"
            : "border-slate-300 hover:border-[#2D5F8B] hover:bg-blue-50/30 bg-white"
        }`}>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*"
          className="hidden" onChange={e => addFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
            isDragging ? "bg-[#E8873A]/20" : "bg-slate-100"
          }`}>
            <Upload className={`w-8 h-8 ${isDragging ? "text-[#E8873A]" : "text-slate-400"}`} />
          </div>
          <div>
            <p className="text-[#1E293B] font-semibold text-base">
              {isDragging ? "释放鼠标即可上传" : "拖拽文件到此处，或点击选择"}
            </p>
            <p className="text-slate-400 text-sm mt-1">支持 JPG、PNG、WEBP 图片及 MP4、MOV 视频格式</p>
          </div>
          <div className="flex gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              <Image className="w-3.5 h-3.5" /> 图片
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              <Film className="w-3.5 h-3.5" /> 视频
            </span>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="text-sm font-semibold text-[#1E293B]">
              已上传文件 <span className="text-slate-400 font-normal">({doneCount}/{files.length})</span>
            </div>
            <div className="flex gap-2">
              {doneCount > 0 && !sentToAnalysis && (
                <button onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-xl text-sm text-white font-medium hover:opacity-90 cursor-pointer transition-all shadow-sm"
                  style={{ background: "linear-gradient(135deg, #1E3A5F, #2D5F8B)" }}>
                  批量导入确认 ({doneCount})
                </button>
              )}
              {(doneCount > 0) && (
                <button onClick={handleGoToAnalysis}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white font-medium hover:opacity-90 cursor-pointer transition-all shadow-sm"
                  style={{ background: "linear-gradient(135deg, #E8873A, #d97706)" }}>
                  <ScanLine className="w-4 h-4" />
                  发送到 AI 识别
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {sentToAnalysis && (
            <div className="px-5 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 text-green-500" />
              已成功导入 {doneCount} 个文件到项目，可前往 AI 识别检测页进行分析
              <button onClick={() => navigate(`/projects/${id}/analysis`)}
                className="ml-auto flex items-center gap-1 text-xs font-medium text-white px-3 py-1.5 rounded-lg cursor-pointer"
                style={{ background: "#E8873A" }}>
                前往识别 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {files.map(f => (
              <div key={f.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                {/* 缩略图 */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                  {f.previewUrl ? (
                    <img src={f.previewUrl} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                    <Film className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E293B] truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(f.size)} · {f.type === "image" ? "图片" : "视频"}</p>
                  {f.status === "uploading" && (
                    <div className="h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#2D5F8B] rounded-full transition-all duration-200"
                        style={{ width: `${f.progress}%` }} />
                    </div>
                  )}
                </div>
                {/* 状态 */}
                <div className="flex items-center gap-2">
                  {f.status === "done" && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {f.status === "uploading" && (
                    <span className="text-xs text-blue-500 font-medium">{f.progress}%</span>
                  )}
                  {f.status === "error" && <AlertCircle className="w-5 h-5 text-red-400" />}
                  <button onClick={() => removeFile(f.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 cursor-pointer transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
