/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/store.ts
import { create } from "zustand";
import { useMemo } from "react";
import { GenerationRecord, AsyncOperation } from "./types";
import { generationApi, historyApi } from "./api";
import { TIMING, PAGINATION, ASYNC_OPERATION_TYPES } from "./constants";

interface AppStore {
  // 异步操作状态 - 统一管理
  asyncOperation: AsyncOperation & {
    // 新增字段用于传递给 LoadingState
    enableTts?: boolean;
    model?: "claude" | "qwen";
  };

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
  setAsyncOperation: (
    operation: Partial<
      AsyncOperation & { enableTts?: boolean; model?: "claude" | "qwen" }
    >
  ) => void;
  setSelectedRecord: (record: GenerationRecord | null) => void;
  setRecentRecords: (records: GenerationRecord[]) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setModelFilter: (model: string) => void;
  setStatusFilter: (status: string) => void;

  // 业务操作
  generateFull: (
    question: string,
    model: "claude" | "qwen",
    enableTts?: boolean,
    voiceType?: string
  ) => Promise<void>;
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
    enableTts: undefined,
    model: undefined,
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

  // 生成完整内容（支持音频）
  generateFull: async (
    question: string,
    model: "claude" | "qwen",
    enableTts = true,
    voiceType = "Cherry"
  ) => {
    const { setAsyncOperation, addRecord, resetAsyncOperation } = get();

    try {
      setAsyncOperation({
        isLoading: true,
        type: ASYNC_OPERATION_TYPES.GENERATING,
        progress: 0,
        currentStep: "📝 开始生成物理解释...",
        enableTts, // 传递给 LoadingState
        model, // 传递给 LoadingState
      });
      set({ error: null });

      // 新的进度更新逻辑 - 基于实际时间阶段
      let elapsedTime = 0;
      const totalDuration = enableTts
        ? TIMING.GENERATION.WITH_TTS
        : TIMING.GENERATION.WITHOUT_TTS;

      const progressInterval = setInterval(() => {
        elapsedTime += 1;

        let currentStep = "";
        let progress = 0;

        if (elapsedTime <= TIMING.GENERATION.EXPLANATION_PHASE) {
          // 阶段1: 生成物理解释 (0-10秒)
          currentStep = "📝 正在生成物理解释...";
          progress = (elapsedTime / totalDuration) * 100;
        } else if (
          elapsedTime <=
          TIMING.GENERATION.EXPLANATION_PHASE + TIMING.GENERATION.SVG_PHASE
        ) {
          // 阶段2: 生成SVG动画 (10-40秒)
          currentStep = "🎨 正在生成SVG动画...";
          progress = (elapsedTime / totalDuration) * 100;
        } else if (enableTts && elapsedTime <= totalDuration) {
          // 阶段3: 生成语音 (40-60秒，仅在启用TTS时)
          currentStep = "🎤 正在生成语音解释...";
          progress = (elapsedTime / totalDuration) * 100;
        } else {
          // 完成阶段
          currentStep = "🎯 即将完成...";
          progress = Math.min(95, (elapsedTime / totalDuration) * 100);
        }

        if (elapsedTime < totalDuration) {
          setAsyncOperation({
            progress,
            currentStep,
          });
        }
      }, 1000);

      const result = await generationApi.generateFull({
        question,
        model,
        enable_tts: enableTts,
        voice_type: voiceType as any,
      });

      clearInterval(progressInterval);
      setAsyncOperation({
        progress: 100,
        currentStep: "✅ 生成完成!",
      });

      // 转换为内部格式（包含音频信息）
      const newRecord: GenerationRecord = {
        id: result.id,
        question: result.question,
        explanation: result.content.explanation,
        svg_code: result.animation.svgCode,
        model: result.model as "claude" | "qwen",
        status: "success",
        created_at: result.created_at,
        // 音频相关字段
        audio_url: result.audio?.url,
        audio_metadata: result.audio?.metadata,
      };

      // 添加记录并选中
      addRecord(newRecord);
      set({ selectedRecord: newRecord });

      setTimeout(() => {
        resetAsyncOperation();
      }, 1500);
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
        type: ASYNC_OPERATION_TYPES.MODIFYING,
        progress: 0,
        currentStep: "🔧 正在分析修改要求...",
        model, // 传递给 LoadingState
      });
      set({ error: null });

      // 修改动画的进度逻辑 - 使用常量配置
      let elapsedTime = 0;
      const totalDuration = TIMING.MODIFICATION.TOTAL;

      const progressInterval = setInterval(() => {
        elapsedTime += 1;

        let currentStep = "";
        const progress = (elapsedTime / totalDuration) * 100;

        if (elapsedTime <= TIMING.MODIFICATION.ANALYSIS_PHASE) {
          currentStep = "🔧 正在分析修改要求...";
        } else if (
          elapsedTime <=
          TIMING.MODIFICATION.ANALYSIS_PHASE +
            TIMING.MODIFICATION.MODIFICATION_PHASE
        ) {
          currentStep = "🎨 正在修改SVG动画...";
        } else {
          currentStep = "✨ 正在优化动画效果...";
        }

        if (elapsedTime < totalDuration) {
          setAsyncOperation({
            progress: Math.min(90, progress),
            currentStep,
          });
        }
      }, 1000);

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
      }, 1500);

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
        type: ASYNC_OPERATION_TYPES.LOADING,
        currentStep: "📚 加载历史记录...",
      });

      const params: Record<string, any> = {
        page,
        page_size: PAGINATION.DEFAULT_PAGE_SIZE,
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
        // 音频相关字段
        audio_url: item.audio_url,
        audio_metadata: item.audio_metadata,
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
      recentRecords: [record, ...state.recentRecords].slice(
        0,
        PAGINATION.MAX_RECENT_RECORDS
      ),
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
        enableTts: undefined,
        model: undefined,
      },
    }),
}));

// 单独导出actions - 使用 useCallback 避免重新创建
export const useAppActions = () => {
  const store = useAppStore();

  // 使用 useMemo 确保 actions 对象的稳定性
  return useMemo(
    () => ({
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
    }),
    [
      store.generateFull,
      store.modifySvg,
      store.loadHistory,
      store.loadRecordById,
      store.deleteRecord,
      store.exportRecord,
      store.setSearchQuery,
      store.setModelFilter,
      store.setStatusFilter,
      store.setSelectedRecord,
      store.updateRecordSvg,
      store.clearError,
    ]
  );
};
