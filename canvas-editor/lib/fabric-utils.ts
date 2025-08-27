/* eslint-disable @typescript-eslint/no-explicit-any */
import { fabric } from "fabric";
import { ObjectPosition } from "@/types/canvas";

// 计算对象在屏幕上的位置（用于浮动工具栏定位）
export function getObjectScreenPosition(
  object: fabric.Object,
  canvas: fabric.Canvas
): ObjectPosition {
  const boundingRect = object.getBoundingRect();
  const canvasElement = canvas.getElement();
  const canvasRect = canvasElement.getBoundingClientRect();

  return {
    x: canvasRect.left + boundingRect.left * canvas.getZoom(),
    y: canvasRect.top + boundingRect.top * canvas.getZoom(),
    width: boundingRect.width * canvas.getZoom(),
    height: boundingRect.height * canvas.getZoom(),
  };
}

// 创建基础形状
export function createShape(type: string, options: any = {}) {
  const defaultOptions = {
    left: 100,
    top: 100,
    fill: "#3b82f6",
    stroke: "#1e40af",
    strokeWidth: 2,
    ...options,
  };

  switch (type) {
    case "rectangle":
      return new fabric.Rect({
        width: 100,
        height: 60,
        ...defaultOptions,
      });

    case "circle":
      return new fabric.Circle({
        radius: 50,
        ...defaultOptions,
      });

    case "triangle":
      return new fabric.Triangle({
        width: 80,
        height: 80,
        ...defaultOptions,
      });

    default:
      return null;
  }
}

// 创建文本对象
export function createText(text: string = "Text", options: any = {}) {
  return new fabric.Textbox(text, {
    left: 100,
    top: 100,
    width: 200,
    fontSize: 20,
    fill: "#000000",
    fontFamily: "Arial",
    ...options,
  });
}

// 导出画布为图片
export function exportCanvas(
  canvas: fabric.Canvas,
  format: "png" | "jpg" | "svg" = "png"
) {
  switch (format) {
    case "png":
      return canvas.toDataURL({
        format: "png",
        quality: 1,
      });
    case "jpg":
      return canvas.toDataURL({
        format: "jpeg",
        quality: 0.8,
      });
    case "svg":
      return canvas.toSVG();
    default:
      return canvas.toDataURL({
        format: "png",
        quality: 1,
      });
  }
}

// 设置画布背景
export function setCanvasBackground(canvas: fabric.Canvas, color: string) {
  canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
}
