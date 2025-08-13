// lib/editor/types.ts
export interface EditorState {
  isEditing: boolean;
  currentTool: "select" | "rectangle" | "circle" | "line" | "text";
  selectedObjects: fabric.Object[];
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  canvasSize: { width: number; height: number };
}

export interface EditorTool {
  id: string;
  name: string;
  icon: string;
  cursor?: string;
  description?: string;
}

export interface FabricObjectData {
  id: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
}

export interface SVGParseResult {
  objects: fabric.Object[];
  canvasSize: { width: number; height: number };
  success: boolean;
  error?: string;
}

export interface EditorHistory {
  past: string[];
  present: string;
  future: string[];
}
