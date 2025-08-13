// lib/editor/editorStore.ts
import { create } from "zustand";
import { EditorState, EditorHistory } from "./types";

interface EditorStore extends EditorState {
  // 编辑器控制
  setEditing: (editing: boolean) => void;
  setCurrentTool: (tool: EditorState["currentTool"]) => void;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  setZoom: (zoom: number) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;

  // 历史记录
  history: EditorHistory;
  pushHistory: (state: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  clearHistory: () => void;

  // Fabric.js 画布引用
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;

  // 工具方法
  reset: () => void;
}

const initialState: EditorState = {
  isEditing: false,
  currentTool: "select",
  selectedObjects: [],
  canUndo: false,
  canRedo: false,
  zoom: 1,
  canvasSize: { width: 1000, height: 600 },
};

const initialHistory: EditorHistory = {
  past: [],
  present: "",
  future: [],
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  // 初始状态
  ...initialState,
  history: initialHistory,
  canvas: null,

  // 基础设置方法
  setEditing: (isEditing) => set({ isEditing }),

  setCurrentTool: (currentTool) => set({ currentTool }),

  setSelectedObjects: (selectedObjects) => set({ selectedObjects }),

  setZoom: (zoom) => {
    set({ zoom });
    // 同步更新 Fabric.js 画布缩放
    const { canvas } = get();
    if (canvas) {
      canvas.setZoom(zoom);
      canvas.renderAll();
    }
  },

  setCanvasSize: (canvasSize) => set({ canvasSize }),

  setCanvas: (canvas) => set({ canvas }),

  // 历史记录管理
  pushHistory: (state) => {
    const { history } = get();
    const newHistory: EditorHistory = {
      past: [...history.past, history.present].filter(Boolean),
      present: state,
      future: [], // 新操作会清除 future
    };

    // 限制历史记录数量
    if (newHistory.past.length > 50) {
      newHistory.past = newHistory.past.slice(-50);
    }

    set({
      history: newHistory,
      canUndo: newHistory.past.length > 0,
      canRedo: false,
    });
  },

  undo: () => {
    const { history } = get();
    if (history.past.length === 0) return null;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    const newHistory: EditorHistory = {
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    };

    set({
      history: newHistory,
      canUndo: newPast.length > 0,
      canRedo: true,
    });

    return previous;
  },

  redo: () => {
    const { history } = get();
    if (history.future.length === 0) return null;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    const newHistory: EditorHistory = {
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    };

    set({
      history: newHistory,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });

    return next;
  },

  clearHistory: () =>
    set({
      history: initialHistory,
      canUndo: false,
      canRedo: false,
    }),

  // 重置状态
  reset: () =>
    set({
      ...initialState,
      history: initialHistory,
      canvas: null,
    }),
}));
