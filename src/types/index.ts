// ===== 工程项目类型 =====
export type ProjectStatus = 'active' | 'completed' | 'pending' | 'archived';
export type RoadType = '高速公路' | '国道' | '省道' | '县道' | '城市主干道' | '城市次干道';

export interface Project {
  id: string;
  name: string;
  roadType: RoadType;
  location: string;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  defectCount: number;
  pendingCount: number;
  fixedCount: number;
  severeCount: number;
  inspector: string;
  description: string;
  coverImage?: string;
}

// ===== 病害类型 =====
export type DefectType = '纵向裂缝' | '横向裂缝' | '网状裂缝' | '坑槽' | '车辙' | '沉陷' | '泛油' | '松散' | '其他';
export type DefectSeverity = '轻微' | '中等' | '严重' | '极严重';
export type DefectStatus = '待处理' | '处理中' | '已修复' | '已复查';

export interface Defect {
  id: string;
  projectId: string;
  serialNo: number;
  type: DefectType;
  severity: DefectSeverity;
  status: DefectStatus;
  location: string;
  gpsCoords?: { lat: number; lng: number };
  description: string;
  imageUrl?: string;
  detectedAt: string;
  updatedAt: string;
  inspector: string;
  width?: number;   // mm
  length?: number;  // m
  area?: number;    // m²
  repairMethod?: string;
  notes?: string;
}

// ===== 导入文件类型 =====
export type ImportFileType = 'image' | 'video';
export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface ImportedFile {
  id: string;
  name: string;
  size: number;
  type: ImportFileType;
  status: UploadStatus;
  progress: number;
  previewUrl?: string;
  uploadedAt: string;
  projectId: string;
}

// ===== YOLOv AI 识别类型 =====
export type YoloModelType =
  | 'yolov8-detect'
  | 'yolov8-seg'
  | 'yolov11-detect'
  | 'yolov11-seg'
  | 'yolov26-detect'
  | 'yolov26-seg'
  | 'custom';

export interface ModelConfig {
  modelType: YoloModelType;
  apiEndpoint: string;
  apiKey?: string;
  gsd: number;         // 地面采样距离 cm/px
  confidenceThreshold: number;
  iouThreshold: number;
  // 自定义模型扩展参数
  customModelName?: string;    // 自定义模型名称
  customModelVersion?: string; // 自定义模型版本
  customInputSize?: number;    // 输入图像尺寸
  customClasses?: string;      // 自定义类别（逗号分隔）
  useMock?: boolean;           // 是否使用 Mock（调试用）
}

// YOLOv BBox: [x1, y1, x2, y2] 绝对像素坐标
export type BBox = [number, number, number, number];
// 分割多边形: [[x1,y1],[x2,y2],...] 绝对像素坐标
export type Polygon = number[][];

export interface DetectedDefect {
  id: string;
  imageId: string;
  imageUrl: string;
  defectType: DefectType;
  confidence: number;
  bbox: BBox;
  polygon?: Polygon;   // seg 模型输出
  pixelArea?: number;  // 像素面积 (seg模型)
  pixelLength?: number;// 像素长度 (裂缝)
  // 换算后实际尺寸
  area?: number;       // m²
  length?: number;     // m
  width?: number;      // mm
  severity: DefectSeverity;
  location?: string;
}

export interface AnalyzedImage {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  detectedDefects: DetectedDefect[];
  analyzedAt: string;
}

export interface AnalysisState {
  projectId: string | null;
  modelConfig: ModelConfig;
  analyzedImages: AnalyzedImage[];
  allDetectedDefects: DetectedDefect[];
  isAnalyzing: boolean;
  progress: number;
  analysisTime: string | null;
  importedFilesByProject: Record<string, ImportedFile[]>;
  exportedToReport: Record<string, string | null>; // projectId -> 导入时间 ISO string
}

// ===== 报告类型 =====
export interface DefectReport {
  reportId: string;
  projectId: string;
  projectName: string;
  modelUsed: string;
  gsd: number;
  inspector: string;
  generatedAt: string;
  totalDefects: number;
  defectsByType: Record<string, number>;
  defectsBySeverity: Record<string, number>;
  defects: DetectedDefect[];
}

// ===== 认证类型 =====
export interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
