import {
  YoloModelType,
  ModelConfig,
  DetectedDefect,
  AnalyzedImage,
  DefectType,
  DefectSeverity,
} from "../types/index";
import { mockDetectedDefects, mockAnalyzedImages } from "../data/mock-analysis";

// ===== 病害类型颜色映射 =====
export const DEFECT_COLORS: Record<string, string> = {
  "纵向裂缝": "rgba(239,68,68,0.5)",
  "横向裂缝": "rgba(249,115,22,0.5)",
  "网状裂缝": "rgba(234,179,8,0.5)",
  "坑槽":     "rgba(139,92,246,0.5)",
  "车辙":     "rgba(59,130,246,0.5)",
  "沉陷":     "rgba(236,72,153,0.5)",
  "泛油":     "rgba(20,184,166,0.5)",
  "松散":     "rgba(107,114,128,0.5)",
  "其他":     "rgba(100,116,139,0.5)",
};

export const DEFECT_BBOX_COLORS: Record<string, string> = {
  "纵向裂缝": "#EF4444",
  "横向裂缝": "#F97316",
  "网状裂缝": "#EAB308",
  "坑槽":     "#8B5CF6",
  "车辙":     "#3B82F6",
  "沉陷":     "#EC4899",
  "泛油":     "#14B8A6",
  "松散":     "#6B7280",
  "其他":     "#64748B",
};

// ===== GSD 换算工具 =====
export function pixelToMetric(pixels: number, gsd: number): number {
  return (pixels * gsd) / 100;
}

export function pixelAreaToSqMeter(pixelArea: number, gsd: number): number {
  return (pixelArea * gsd * gsd) / 10000;
}

// ===== 模型配置标签 =====
export const MODEL_LABELS: Record<YoloModelType, string> = {
  "yolov8-detect":  "YOLOv8-Detect（目标检测）",
  "yolov8-seg":     "YOLOv8-Seg（实例分割）",
  "yolov11-detect": "YOLOv11-Detect（目标检测）",
  "yolov11-seg":    "YOLOv11-Seg（实例分割）",
  "yolov26-detect": "YOLOv26-Detect（目标检测）",
  "yolov26-seg":    "YOLOv26-Seg（实例分割）",
  "custom":         "自定义模型",
};

// 是否为分割模型
export function isSegModel(modelType: YoloModelType): boolean {
  return modelType.endsWith("-seg");
}

// ===== 严重程度推断 =====
function inferSeverity(defectType: DefectType, confidence: number, area?: number): DefectSeverity {
  if (defectType === "坑槽" || defectType === "沉陷") {
    if (area && area > 2) return "极严重";
    if (area && area > 0.5) return "严重";
    return "中等";
  }
  if (defectType === "网状裂缝") return confidence > 0.9 ? "严重" : "中等";
  if (confidence > 0.9) return "严重";
  if (confidence > 0.75) return "中等";
  return "轻微";
}

// ===== Mock 延迟 =====
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== AI 模型服务接口 =====
export interface AnalysisProgress {
  stage: string;
  percent: number;
}

export type ProgressCallback = (progress: AnalysisProgress) => void;

/**
 * 运行 AI 识别分析
 * - useMock=true（默认）：使用内置 Mock 数据（演示/调试）
 * - useMock=false：调用真实 YOLO REST API（需配置 apiEndpoint）
 *
 * 真实 API 格式（POST JSON）:
 * Request: { image: base64String, model: modelType, conf: threshold, iou: iouThreshold }
 * Response: { results: [{ class_name, confidence, bbox: [x1,y1,x2,y2], polygon?: [...] }] }
 */
export async function runAnalysis(
  images: Array<{ id: string; name: string; url: string; width: number; height: number }>,
  config: ModelConfig,
  onProgress?: ProgressCallback
): Promise<AnalyzedImage[]> {
  const useMock = config.useMock !== false; // 默认 true（Mock），显式设为 false 时调用真实 API

  if (useMock) {
    return runMockAnalysis(images, config, onProgress);
  } else {
    return callRealYoloApi(images, config, onProgress);
  }
}

// ===== Mock 识别实现 =====
async function runMockAnalysis(
  images: Array<{ id: string; name: string; url: string; width: number; height: number }>,
  config: ModelConfig,
  onProgress?: ProgressCallback
): Promise<AnalyzedImage[]> {
  const results: AnalyzedImage[] = [];
  const total = images.length;

  for (let i = 0; i < total; i++) {
    const img = images[i];
    onProgress?.({ stage: `正在分析: ${img.name}`, percent: Math.floor((i / total) * 80) });
    await delay(800 + Math.random() * 600);

    const existingResult = mockAnalyzedImages.find(m => m.id === img.id);
    if (existingResult) {
      const processedDefects = existingResult.detectedDefects
        .filter(d => d.confidence >= config.confidenceThreshold)
        .map(d => ({
          ...d,
          area: d.pixelArea ? pixelAreaToSqMeter(d.pixelArea, config.gsd) : d.area,
          length: d.pixelLength ? pixelToMetric(d.pixelLength, config.gsd) : d.length,
          severity: inferSeverity(d.defectType, d.confidence, d.area),
        }));
      results.push({ ...existingResult, detectedDefects: processedDefects, analyzedAt: new Date().toISOString() });
    } else {
      const randomDefects = generateRandomDefects(img, config);
      results.push({
        id: img.id,
        name: img.name,
        url: img.url,
        width: img.width,
        height: img.height,
        detectedDefects: randomDefects,
        analyzedAt: new Date().toISOString(),
      });
    }
  }

  onProgress?.({ stage: "生成检测报告", percent: 90 });
  await delay(400);
  onProgress?.({ stage: "分析完成", percent: 100 });
  return results;
}

// ===== 随机生成检测结果（用于非 Mock 图片）=====
function generateRandomDefects(
  img: { id: string; url: string },
  config: ModelConfig
): DetectedDefect[] {
  const defectTypes: DefectType[] = ["纵向裂缝", "横向裂缝", "坑槽", "网状裂缝", "车辙"];
  const count = Math.floor(Math.random() * 3) + 1;
  return Array.from({ length: count }, (_, i) => {
    const type = defectTypes[Math.floor(Math.random() * defectTypes.length)];
    const confidence = 0.6 + Math.random() * 0.38;
    const x1 = Math.floor(Math.random() * 400) + 50;
    const y1 = Math.floor(Math.random() * 300) + 50;
    const w = Math.floor(Math.random() * 200) + 80;
    const h = Math.floor(Math.random() * 80) + 30;
    const pixelArea = w * h;
    return {
      id: `det-${img.id}-${i}`,
      imageId: img.id,
      imageUrl: img.url,
      defectType: type,
      confidence: Math.round(confidence * 100) / 100,
      bbox: [x1, y1, x1 + w, y1 + h] as [number,number,number,number],
      polygon: [[x1,y1],[x1+w,y1],[x1+w,y1+h],[x1,y1+h]],
      pixelArea,
      area: pixelAreaToSqMeter(pixelArea, config.gsd),
      severity: inferSeverity(type, confidence),
      location: `图像坐标 (${x1}, ${y1})`,
    };
  });
}

// ===== 真实 YOLO API 对接 =====
/**
 * 标准 YOLO REST API 规范（支持 YOLOv8/v11/v26/自定义）
 *
 * 请求格式 (POST application/json):
 * {
 *   "image": "<base64 encoded image>",
 *   "model": "yolov8-seg",              // 模型类型
 *   "model_name": "road_defect_v1",     // 自定义模型时使用
 *   "conf": 0.5,                        // 置信度阈值
 *   "iou": 0.45,                        // IOU阈值
 *   "input_size": 640                   // 输入尺寸（可选）
 * }
 *
 * 响应格式:
 * {
 *   "results": [
 *     {
 *       "class_id": 0,
 *       "class_name": "纵向裂缝",
 *       "confidence": 0.95,
 *       "bbox": [120, 80, 680, 110],    // [x1, y1, x2, y2]
 *       "polygon": [[x,y], ...]          // seg 模型输出
 *     }
 *   ],
 *   "image_width": 800,
 *   "image_height": 600
 * }
 */
async function callRealYoloApi(
  images: Array<{ id: string; name: string; url: string; width: number; height: number }>,
  config: ModelConfig,
  onProgress?: ProgressCallback
): Promise<AnalyzedImage[]> {
  const results: AnalyzedImage[] = [];
  const total = images.length;

  for (let i = 0; i < total; i++) {
    const img = images[i];
    onProgress?.({ stage: `请求 API: ${img.name}`, percent: Math.floor((i / total) * 80) });

    try {
      // 将图像转为 base64
      const base64 = await urlToBase64(img.url);

      const requestBody: Record<string, unknown> = {
        image: base64,
        model: config.modelType,
        conf: config.confidenceThreshold,
        iou: config.iouThreshold,
      };
      // 自定义模型附加参数
      if (config.modelType === "custom") {
        requestBody.model_name = config.customModelName || "custom";
        requestBody.model_version = config.customModelVersion || "latest";
        if (config.customInputSize) requestBody.input_size = config.customInputSize;
      }

      const resp = await fetch(config.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey ? { "Authorization": `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      if (!resp.ok) throw new Error(`API 返回错误: ${resp.status} ${resp.statusText}`);

      const data = await resp.json();
      const detectedDefects: DetectedDefect[] = (data.results || []).map((r: {
        class_id?: number;
        class_name: string;
        confidence: number;
        bbox: [number, number, number, number];
        polygon?: number[][];
        pixel_area?: number;
        pixel_length?: number;
      }, idx: number) => {
        const pixelArea = r.pixel_area || (r.bbox ? (r.bbox[2]-r.bbox[0]) * (r.bbox[3]-r.bbox[1]) : 0);
        return {
          id: `api-${img.id}-${idx}`,
          imageId: img.id,
          imageUrl: img.url,
          defectType: r.class_name as DefectType,
          confidence: r.confidence,
          bbox: r.bbox,
          polygon: r.polygon,
          pixelArea,
          pixelLength: r.pixel_length,
          area: pixelAreaToSqMeter(pixelArea, config.gsd),
          length: r.pixel_length ? pixelToMetric(r.pixel_length, config.gsd) : undefined,
          severity: inferSeverity(r.class_name as DefectType, r.confidence,
            pixelAreaToSqMeter(pixelArea, config.gsd)),
          location: `${img.name} (${r.bbox[0]}, ${r.bbox[1]})`,
        };
      });

      results.push({
        id: img.id,
        name: img.name,
        url: img.url,
        width: data.image_width || img.width,
        height: data.image_height || img.height,
        detectedDefects,
        analyzedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`[YOLO API] 图像 ${img.name} 识别失败:`, err);
      // 失败时降级为 Mock
      onProgress?.({ stage: `${img.name} 连接失败，使用 Mock 数据`, percent: Math.floor((i / total) * 80) });
      const fallback = generateRandomDefects(img, config);
      results.push({
        id: img.id, name: img.name, url: img.url,
        width: img.width, height: img.height,
        detectedDefects: fallback, analyzedAt: new Date().toISOString(),
      });
    }
  }

  onProgress?.({ stage: "生成检测报告", percent: 90 });
  await delay(200);
  onProgress?.({ stage: "分析完成", percent: 100 });
  return results;
}

// 将图像 URL 转为 base64
async function urlToBase64(url: string): Promise<string> {
  if (url.startsWith("data:")) return url.split(",")[1];
  if (url.startsWith("blob:") || url.startsWith("http")) {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  return url;
}

export { mockDetectedDefects, mockAnalyzedImages };
