"use client";

import { useCanvasStore } from "@/store/canvas-store";
import { useEffect, useState } from "react";

export default function StatusBar() {
  const { canvas, selectedObject, zoom, currentTool } = useCanvasStore();
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [objectInfo, setObjectInfo] = useState<string>("");

  useEffect(() => {
    if (!canvas) return;

    const updateCanvasSize = () => {
      setCanvasSize({
        width: canvas.width || 800,
        height: canvas.height || 600,
      });
    };

    // 监听画布尺寸变化
    canvas.on("canvas:resized", updateCanvasSize);
    updateCanvasSize();

    return () => {
      canvas.off("canvas:resized", updateCanvasSize);
    };
  }, [canvas]);

  useEffect(() => {
    if (selectedObject) {
      const type = selectedObject.type || "object";
      const left = Math.round(selectedObject.left || 0);
      const top = Math.round(selectedObject.top || 0);

      let sizeInfo = "";
      if (selectedObject.type === "circle") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const radius = Math.round((selectedObject as any).radius || 0);
        sizeInfo = `r:${radius}`;
      } else {
        const width = Math.round(selectedObject.width || 0);
        const height = Math.round(selectedObject.height || 0);
        sizeInfo = `${width}×${height}`;
      }

      setObjectInfo(
        `选中: ${type} | 位置: (${left}, ${top}) | 尺寸: ${sizeInfo}`
      );
    } else {
      setObjectInfo("");
    }
  }, [selectedObject]);

  const getToolName = (tool: string) => {
    const toolNames: Record<string, string> = {
      select: "选择",
      rectangle: "矩形",
      circle: "圆形",
      triangle: "三角形",
      text: "文本",
      draw: "画笔",
      eraser: "橡皮",
      line: "直线",
      arrow: "箭头",
    };
    return toolNames[tool] || tool;
  };

  return (
    <div className="h-8 bg-gray-50 border-t border-gray-200 flex items-center px-4 text-xs text-gray-600">
      <div className="flex items-center gap-4">
        {/* 画布信息 */}
        <span>
          画布: {canvasSize.width}×{canvasSize.height}
        </span>

        {/* 缩放信息 */}
        <span>缩放: {Math.round(zoom * 100)}%</span>

        {/* 当前工具 */}
        <span>工具: {getToolName(currentTool)}</span>

        {/* 对象信息 */}
        {objectInfo && (
          <>
            <span className="text-gray-400">|</span>
            <span>{objectInfo}</span>
          </>
        )}
      </div>

      {/* 右侧状态 */}
      <div className="flex-1" />
      <span className="text-green-600">● 就绪</span>
    </div>
  );
}
