import { fabric } from "fabric";

export interface CanvasState {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  isDrawing: boolean;
  currentTool: string;
  zoom: number;
}

export interface ObjectPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloatingToolbarPosition {
  x: number;
  y: number;
  visible: boolean;
}

export type ToolType =
  | "select"
  | "rectangle"
  | "circle"
  | "triangle"
  | "polygon"
  | "star"
  | "ellipse"
  | "diamond"
  | "arrow"
  | "heart"
  | "line"
  | "text"
  | "draw"
  | "eraser";

export interface CanvasOptions {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface ObjectStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  shadow?: fabric.Shadow;
}
