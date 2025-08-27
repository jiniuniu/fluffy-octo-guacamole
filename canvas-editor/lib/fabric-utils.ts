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

    case "polygon":
      // 创建六边形
      const hexagonPoints = [];
      const sides = 6;
      const radius = 50;
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        hexagonPoints.push({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
        });
      }
      return new fabric.Polygon(hexagonPoints, {
        ...defaultOptions,
      });

    case "star":
      // 创建五角星
      const starPoints = [];
      const spikes = 5;
      const outerRadius = 50;
      const innerRadius = 20;

      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        starPoints.push({
          x: radius * Math.cos(angle - Math.PI / 2),
          y: radius * Math.sin(angle - Math.PI / 2),
        });
      }
      return new fabric.Polygon(starPoints, {
        ...defaultOptions,
      });

    case "ellipse":
      return new fabric.Ellipse({
        rx: 60,
        ry: 40,
        ...defaultOptions,
      });

    case "diamond":
      // 创建菱形
      const diamondPoints = [
        { x: 0, y: -50 },
        { x: 50, y: 0 },
        { x: 0, y: 50 },
        { x: -50, y: 0 },
      ];
      return new fabric.Polygon(diamondPoints, {
        ...defaultOptions,
      });

    case "arrow":
      // 创建箭头
      const arrowPoints = [
        { x: -40, y: -20 },
        { x: 20, y: -20 },
        { x: 20, y: -40 },
        { x: 60, y: 0 },
        { x: 20, y: 40 },
        { x: 20, y: 20 },
        { x: -40, y: 20 },
      ];
      return new fabric.Polygon(arrowPoints, {
        ...defaultOptions,
      });

    case "heart":
      // 创建心形 (使用路径)
      const heartPath =
        "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z";
      return new fabric.Path(heartPath, {
        ...defaultOptions,
        scaleX: 2,
        scaleY: 2,
      });

    default:
      return null;
  }
}

// 创建线条和箭头
export function createLine(type: "line" | "arrow" = "line", options: any = {}) {
  const defaultOptions = {
    left: 100,
    top: 100,
    stroke: "#1e40af",
    strokeWidth: 2,
    ...options,
  };

  if (type === "line") {
    return new fabric.Line([0, 0, 100, 0], {
      ...defaultOptions,
      selectable: true,
    });
  } else {
    // 创建带箭头的线条使用Path
    const arrowPath = "M 0 0 L 80 0 M 70 -5 L 80 0 L 70 5";

    return new fabric.Path(arrowPath, {
      ...defaultOptions,
      fill: "",
      stroke: defaultOptions.stroke,
      strokeWidth: defaultOptions.strokeWidth,
      left: defaultOptions.left,
      top: defaultOptions.top,
      selectable: true,
    });
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
