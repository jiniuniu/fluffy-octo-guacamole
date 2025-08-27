import { create } from "zustand";
import { fabric } from "fabric";
import { CanvasState, ToolType, FloatingToolbarPosition } from "@/types/canvas";

interface CanvasStore extends CanvasState {
  // Actions
  setCanvas: (canvas: fabric.Canvas) => void;
  setSelectedObject: (object: fabric.Object | null) => void;
  setCurrentTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  setIsDrawing: (isDrawing: boolean) => void;

  // Floating toolbar
  floatingToolbar: FloatingToolbarPosition;
  setFloatingToolbar: (position: FloatingToolbarPosition) => void;

  // History
  history: string[];
  historyIndex: number;
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  // Initial state
  canvas: null,
  selectedObject: null,
  isDrawing: false,
  currentTool: "select",
  zoom: 1,

  floatingToolbar: {
    x: 0,
    y: 0,
    visible: false,
  },

  history: [],
  historyIndex: -1,

  // Actions
  setCanvas: (canvas) => set({ canvas }),

  setSelectedObject: (object) => {
    const { canvas } = get();
    set({ selectedObject: object });

    // Update floating toolbar position
    if (object && canvas) {
      const boundingRect = object.getBoundingRect();
      const canvasElement = canvas.getElement();
      const canvasRect = canvasElement.getBoundingClientRect();

      const toolbarX =
        canvasRect.left +
        (boundingRect.left + boundingRect.width / 2) * canvas.getZoom();
      const toolbarY =
        canvasRect.top + boundingRect.top * canvas.getZoom() - 50;

      set({
        floatingToolbar: {
          x: toolbarX,
          y: toolbarY,
          visible: true,
        },
      });
    } else {
      set({
        floatingToolbar: {
          x: 0,
          y: 0,
          visible: false,
        },
      });
    }
  },

  setCurrentTool: (tool) => set({ currentTool: tool }),
  setZoom: (zoom) => set({ zoom }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  setFloatingToolbar: (position) => set({ floatingToolbar: position }),

  // History management
  saveState: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas) return;

    const state = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll();
      set({ historyIndex: newIndex });
    });
  },

  redo: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll();
      set({ historyIndex: newIndex });
    });
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
}));
