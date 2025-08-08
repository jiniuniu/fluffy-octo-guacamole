// lib/store.ts
import { create } from "zustand";
import { GenerationRecord, AsyncOperation } from "./types";
import { generationApi, historyApi } from "./api";

interface AppStore {
  // 异步操作状态 - 统一管理
  asyncOperation: AsyncOperation;

  // 数据状态
  selectedRecord: GenerationRecord | null;
  recentRecords: GenerationRecord[];
  error: string | null;

  // 分页状态
  currentPage: number;
  totalPages: number;
  totalRecords: number;

  // 筛选状态
  searchQuery: string;
  modelFilter: string;
  statusFilter: string;

  // 基础操作
  setAsyncOperation: (operation: Partial<AsyncOperation>) => void;
  setSelectedRecord: (record: GenerationRecord | null) => void;
  setRecentRecords: (records: GenerationRecord[]) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setModelFilter: (model: string) => void;
  setStatusFilter: (status: string) => void;

  // 业务操作
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

  // 工具方法
  addRecord: (record: GenerationRecord) => void;
  updateRecordSvg: (id: string, newSvgCode: string) => void;
  clearError: () => void;
  resetAsyncOperation: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // 初始状态
  asyncOperation: {
    isLoading: false,
    type: null,
    progress: 0,
    currentStep: "",
  },
  selectedRecord: null,
  recentRecords: [],
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  searchQuery: "",
  modelFilter: "all",
  statusFilter: "all",

  // 基础setters
  setAsyncOperation: (operation) =>
    set((state) => ({
      asyncOperation: { ...state.asyncOperation, ...operation },
    })),
  setSelectedRecord: (selectedRecord) => set({ selectedRecord }),
  setRecentRecords: (recentRecords) => set({ recentRecords }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setModelFilter: (model) => set({ modelFilter: model }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  // 生成完整内容
  generateFull: async (question: string, model: "claude" | "qwen") => {
    const { setAsyncOperation, addRecord, resetAsyncOperation } = get();

    try {
      setAsyncOperation({
        isLoading: true,
        type: "generating",
        progress: 0,
        currentStep: "📝 正在生成物理解释...",
      });
      set({ error: null });

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        const current = get().asyncOperation.progress;
        if (current < 90) {
          setAsyncOperation({ progress: current + Math.random() * 15 });
        }
      }, 500);

      const result = await generationApi.generateFull({ question, model });

      clearInterval(progressInterval);
      setAsyncOperation({
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

      // 添加记录并选中
      addRecord(newRecord);
      set({ selectedRecord: newRecord });

      setTimeout(() => {
        resetAsyncOperation();
      }, 1000);
    } catch (error) {
      console.error("Generation failed:", error);
      set({
        error: error instanceof Error ? error.message : "生成失败，请重试",
      });
      resetAsyncOperation();
    }
  },

  // 修改SVG
  modifySvg: async (
    history_id: string,
    feedback: string,
    model: "claude" | "qwen"
  ) => {
    const { setAsyncOperation, updateRecordSvg, resetAsyncOperation } = get();

    try {
      setAsyncOperation({
        isLoading: true,
        type: "modifying",
        progress: 0,
        currentStep: "🔧 正在修改动画...",
      });
      set({ error: null });

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        const current = get().asyncOperation.progress;
        if (current < 90) {
          setAsyncOperation({ progress: current + Math.random() * 20 });
        }
      }, 300);

      const result = await generationApi.modifySvg({
        history_id,
        feedback,
        model,
      });

      clearInterval(progressInterval);
      setAsyncOperation({
        progress: 100,
        currentStep: "✅ 修改完成!",
      });

      // 更新SVG
      updateRecordSvg(history_id, result.svg_code);

      setTimeout(() => {
        resetAsyncOperation();
      }, 1000);

      return { svg_code: result.svg_code };
    } catch (error) {
      console.error("SVG modification failed:", error);
      set({
        error: error instanceof Error ? error.message : "修改失败，请重试",
      });
      resetAsyncOperation();
      throw error;
    }
  },

  // 加载历史记录
  loadHistory: async (page = 1) => {
    const { searchQuery, modelFilter, statusFilter, setAsyncOperation } = get();

    try {
      setAsyncOperation({
        isLoading: true,
        type: "loading",
        currentStep: "📚 加载历史记录...",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: Record<string, any> = {
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
        error_message: item.error_message,
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
    } finally {
      get().resetAsyncOperation();
    }
  },

  // 加载特定记录
  loadRecordById: async (id: string) => {
    try {
      const result = await historyApi.getById(id);
      set({
        selectedRecord: result,
        error: null,
      });
    } catch (error) {
      console.error("Load record failed:", error);
      set({
        error: error instanceof Error ? error.message : "加载记录失败",
      });
    }
  },

  // 删除记录
  deleteRecord: async (id: string) => {
    try {
      await historyApi.deleteById(id);

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

  // 导出记录
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

  // 工具方法
  addRecord: (record) =>
    set((state) => ({
      recentRecords: [record, ...state.recentRecords].slice(0, 50),
    })),

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

  resetAsyncOperation: () =>
    set({
      asyncOperation: {
        isLoading: false,
        type: null,
        progress: 0,
        currentStep: "",
      },
    }),
}));

// 单独导出actions
export const useAppActions = () => {
  const store = useAppStore();
  return {
    generateFull: store.generateFull,
    modifySvg: store.modifySvg,
    loadHistory: store.loadHistory,
    loadRecordById: store.loadRecordById,
    deleteRecord: store.deleteRecord,
    exportRecord: store.exportRecord,
    setSearchQuery: store.setSearchQuery,
    setModelFilter: store.setModelFilter,
    setStatusFilter: store.setStatusFilter,
    setSelectedRecord: store.setSelectedRecord,
    updateRecordSvg: store.updateRecordSvg,
    clearError: store.clearError,
  };
};
