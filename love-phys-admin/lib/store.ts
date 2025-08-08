// lib/store.ts
import { create } from "zustand";
import { GenerationRecord } from "./types";
import { generationApi, historyApi } from "./api";

interface AppStore {
  // State
  isGenerating: boolean;
  isModifying: boolean; // 新增：修改状态
  progress: number;
  currentStep: string;
  selectedRecord: GenerationRecord | null;
  recentRecords: GenerationRecord[];
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalRecords: number;

  // Search
  searchQuery: string;
  modelFilter: string;
  statusFilter: string;

  // Actions
  setGenerating: (isGenerating: boolean) => void;
  setModifying: (isModifying: boolean) => void; // 新增
  setProgress: (progress: number) => void;
  setCurrentStep: (step: string) => void;
  setSelectedRecord: (record: GenerationRecord | null) => void;
  setRecentRecords: (records: GenerationRecord[]) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setModelFilter: (model: string) => void;
  setStatusFilter: (status: string) => void;

  // API Actions
  generateFull: (question: string, model: "claude" | "qwen") => Promise<void>;
  modifySvg: (
    history_id: string,
    feedback: string,
    model: "claude" | "qwen"
  ) => Promise<{ svg_code: string }>;
  loadHistory: (page?: number) => Promise<void>;
  loadRecordById: (id: string) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  exportRecord: (id: string, format: "svg" | "json") => Promise<void>;

  // Utility
  addRecord: (record: GenerationRecord) => void;
  updateRecordSvg: (id: string, newSvgCode: string) => void; // 新增
  clearError: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  isGenerating: false,
  isModifying: false, // 新增
  progress: 0,
  currentStep: "",
  selectedRecord: null,
  recentRecords: [],
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  searchQuery: "",
  modelFilter: "all",
  statusFilter: "all",

  // Basic setters
  setGenerating: (isGenerating) => set({ isGenerating }),
  setModifying: (isModifying) => set({ isModifying }), // 新增
  setProgress: (progress) => set({ progress }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setSelectedRecord: (selectedRecord) => set({ selectedRecord }),
  setRecentRecords: (recentRecords) => set({ recentRecords }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setModelFilter: (model) => set({ modelFilter: model }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  // Generate full content with real API
  generateFull: async (question: string, model: "claude" | "qwen") => {
    try {
      set({
        isGenerating: true,
        progress: 0,
        currentStep: "📝 正在生成物理解释...",
        error: null,
      });

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        const current = get().progress;
        if (current < 90) {
          set({ progress: current + Math.random() * 15 });
        }
      }, 500);

      const result = await generationApi.generateFull({ question, model });

      clearInterval(progressInterval);
      set({
        progress: 100,
        currentStep: "✅ 生成完成!",
      });

      // 转换为内部格式
      const newRecord: GenerationRecord = {
        id: result.id,
        question: result.question,
        explanation: result.content.explanation,
        svg_code: result.animation.svgCode,
        model: result.model as "claude" | "qwen",
        status: "success",
        created_at: result.created_at,
      };

      // 添加到记录并选中
      get().addRecord(newRecord);
      set({ selectedRecord: newRecord });

      setTimeout(() => {
        set({
          isGenerating: false,
          progress: 0,
          currentStep: "",
        });
      }, 1000);
    } catch (error) {
      console.error("Generation failed:", error);
      set({
        isGenerating: false,
        progress: 0,
        currentStep: "",
        error: error instanceof Error ? error.message : "生成失败，请重试",
      });
    }
  },

  // 新增：修改SVG
  modifySvg: async (
    history_id: string,
    feedback: string,
    model: "claude" | "qwen"
  ) => {
    try {
      set({
        isModifying: true,
        progress: 0,
        currentStep: "🔧 正在修改动画...",
        error: null,
      });

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        const current = get().progress;
        if (current < 90) {
          set({ progress: current + Math.random() * 20 });
        }
      }, 300);

      const result = await generationApi.modifySvg({
        history_id,
        feedback,
        model,
      });

      clearInterval(progressInterval);
      set({
        progress: 100,
        currentStep: "✅ 修改完成!",
      });

      // 更新选中记录的SVG
      get().updateRecordSvg(history_id, result.svg_code);

      setTimeout(() => {
        set({
          isModifying: false,
          progress: 0,
          currentStep: "",
        });
      }, 1000);

      return { svg_code: result.svg_code };
    } catch (error) {
      console.error("SVG modification failed:", error);
      set({
        isModifying: false,
        progress: 0,
        currentStep: "",
        error: error instanceof Error ? error.message : "修改失败，请重试",
      });
      throw error;
    }
  },

  // Load history with pagination and filters
  loadHistory: async (page = 1) => {
    try {
      const { searchQuery, modelFilter, statusFilter } = get();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        page,
        page_size: 20,
      };

      if (searchQuery) params.keyword = searchQuery;
      if (modelFilter && modelFilter !== "all") params.model = modelFilter;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;

      const result = await historyApi.getHistory(params);

      const records: GenerationRecord[] = result.items.map((item) => ({
        id: item.id,
        question: item.question,
        explanation: item.explanation,
        svg_code: item.svg_code,
        model: item.model as "claude" | "qwen",
        status: item.status as "pending" | "success" | "failed",
        created_at: item.created_at,
      }));

      set({
        recentRecords: records,
        currentPage: result.page,
        totalPages: result.total_pages,
        totalRecords: result.total,
        error: null,
      });
    } catch (error) {
      console.error("Load history failed:", error);
      set({
        error: error instanceof Error ? error.message : "加载历史记录失败",
      });
    }
  },

  // Load specific record by ID
  loadRecordById: async (id: string) => {
    try {
      const result = await historyApi.getById(id);

      const record: GenerationRecord = {
        id: result.id,
        question: result.question,
        explanation: result.explanation,
        svg_code: result.svg_code,
        model: result.model as "claude" | "qwen",
        status: result.status as "pending" | "success" | "failed",
        created_at: result.created_at,
      };

      set({
        selectedRecord: record,
        error: null,
      });
    } catch (error) {
      console.error("Load record failed:", error);
      set({
        error: error instanceof Error ? error.message : "加载记录失败",
      });
    }
  },

  // Delete record
  deleteRecord: async (id: string) => {
    try {
      await historyApi.deleteById(id);

      // Remove from local state
      const { recentRecords, selectedRecord } = get();
      const updatedRecords = recentRecords.filter((r) => r.id !== id);

      set({
        recentRecords: updatedRecords,
        selectedRecord: selectedRecord?.id === id ? null : selectedRecord,
        error: null,
      });
    } catch (error) {
      console.error("Delete failed:", error);
      set({
        error: error instanceof Error ? error.message : "删除失败",
      });
    }
  },

  // Export record
  exportRecord: async (id: string, format: "svg" | "json") => {
    try {
      const blob =
        format === "svg"
          ? await historyApi.exportSvg(id)
          : await historyApi.exportJson(id);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `physics_${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      set({
        error: error instanceof Error ? error.message : "导出失败",
      });
    }
  },

  // Utility functions
  addRecord: (record) =>
    set((state) => ({
      recentRecords: [record, ...state.recentRecords].slice(0, 50),
    })),

  // 新增：更新记录的SVG
  updateRecordSvg: (id: string, newSvgCode: string) =>
    set((state) => ({
      recentRecords: state.recentRecords.map((record) =>
        record.id === id ? { ...record, svg_code: newSvgCode } : record
      ),
      selectedRecord:
        state.selectedRecord?.id === id
          ? { ...state.selectedRecord, svg_code: newSvgCode }
          : state.selectedRecord,
    })),

  clearError: () => set({ error: null }),
}));

// 单独导出actions，避免组件中的依赖问题
export const useAppActions = () => {
  const store = useAppStore();
  return {
    generateFull: store.generateFull,
    modifySvg: store.modifySvg, // 新增
    loadHistory: store.loadHistory,
    loadRecordById: store.loadRecordById,
    deleteRecord: store.deleteRecord,
    exportRecord: store.exportRecord,
    setSearchQuery: store.setSearchQuery,
    setModelFilter: store.setModelFilter,
    setStatusFilter: store.setStatusFilter,
    setSelectedRecord: store.setSelectedRecord,
    updateRecordSvg: store.updateRecordSvg, // 新增
    clearError: store.clearError,
  };
};
