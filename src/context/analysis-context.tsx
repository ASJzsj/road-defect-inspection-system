import React, { createContext, useContext, useState } from "react";
import { AnalysisState, AnalyzedImage, ModelConfig, DetectedDefect, ImportedFile } from "../types/index";
import { defaultModelConfig } from "../data/mock-analysis";

interface AnalysisContextType {
  state: AnalysisState;
  setProjectId: (id: string) => void;
  setModelConfig: (config: ModelConfig) => void;
  setAnalyzing: (v: boolean, progress?: number) => void;
  setProgress: (v: number) => void;
  setResults: (images: AnalyzedImage[]) => void;
  clearResults: () => void;
  // 导入文件管理
  addImportedFiles: (files: ImportedFile[]) => void;
  clearImportedFiles: (projectId: string) => void;
  getImportedFiles: (projectId: string) => ImportedFile[];
  // 报告导入
  isExportedToReport: (projectId: string) => boolean;
  setExportedToReport: (projectId: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

const initialState: AnalysisState = {
  projectId: null,
  modelConfig: defaultModelConfig,
  analyzedImages: [],
  allDetectedDefects: [],
  isAnalyzing: false,
  progress: 0,
  analysisTime: null,
  importedFilesByProject: {},
  exportedToReport: {},
};

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AnalysisState>(initialState);

  const setProjectId = (id: string) =>
    setState(s => ({ ...s, projectId: id }));

  const setModelConfig = (config: ModelConfig) =>
    setState(s => ({ ...s, modelConfig: config }));

  const setAnalyzing = (v: boolean, progress = 0) =>
    setState(s => ({ ...s, isAnalyzing: v, progress }));

  const setProgress = (v: number) =>
    setState(s => ({ ...s, progress: v }));

  const setResults = (images: AnalyzedImage[]) => {
    const allDefects: DetectedDefect[] = images.flatMap(img => img.detectedDefects);
    setState(s => ({
      ...s,
      analyzedImages: images,
      allDetectedDefects: allDefects,
      isAnalyzing: false,
      progress: 100,
      analysisTime: new Date().toISOString(),
      // 新一轮检测，清除报告导入标记
      exportedToReport: { ...s.exportedToReport, [s.projectId || ""]: null },
    }));
  };

  const clearResults = () => setState(s => ({ ...s, ...initialState, projectId: s.projectId, modelConfig: s.modelConfig, importedFilesByProject: s.importedFilesByProject }));

  // 报告导入
  const isExportedToReport = (projectId: string): boolean => {
    return !!state.exportedToReport[projectId];
  };

  const setExportedToReport = (projectId: string) => {
    setState(s => ({
      ...s,
      exportedToReport: { ...s.exportedToReport, [projectId]: new Date().toISOString() },
    }));
  };

  // 导入文件管理
  const addImportedFiles = (files: ImportedFile[]) => {
    setState(s => {
      const updated = { ...s.importedFilesByProject };
      files.forEach(f => {
        const pid = f.projectId;
        const existing = updated[pid] || [];
        // 去重
        if (!existing.find(e => e.id === f.id)) {
          updated[pid] = [...existing, f];
        } else {
          updated[pid] = existing.map(e => e.id === f.id ? f : e);
        }
      });
      return { ...s, importedFilesByProject: updated };
    });
  };

  const clearImportedFiles = (projectId: string) => {
    setState(s => {
      const updated = { ...s.importedFilesByProject };
      delete updated[projectId];
      return { ...s, importedFilesByProject: updated };
    });
  };

  const getImportedFiles = (projectId: string): ImportedFile[] => {
    return state.importedFilesByProject[projectId] || [];
  };

  return (
    <AnalysisContext.Provider value={{
      state, setProjectId, setModelConfig, setAnalyzing, setProgress, setResults, clearResults,
      addImportedFiles, clearImportedFiles, getImportedFiles,
      isExportedToReport, setExportedToReport,
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextType {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
