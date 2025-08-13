// components/editor/canvas/FabricCanvas.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { useEditorStore } from "@/lib/editor/editorStore";
import { SVGParser } from "@/lib/editor/svgParser";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FabricCanvasProps {
  svgCode: string;
  onSvgChange?: (newSvgCode: string) => void;
  className?: string;
}

export function FabricCanvas({
  svgCode,
  onSvgChange,
  className = "",
}: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null); // 添加 canvas 实例的 ref
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    canvas,
    setCanvas,
    currentTool,
    zoom,
    canvasSize,
    setCanvasSize,
    setSelectedObjects,
    pushHistory,
  } = useEditorStore();

  // 同步 canvas 到 ref
  useEffect(() => {
    canvasInstanceRef.current = canvas;
  }, [canvas]);

  // 在 currentTool 声明之后创建 ref
  const currentToolRef = useRef(currentTool);

  // 更新工具 ref
  useEffect(() => {
    currentToolRef.current = currentTool;
  }, [currentTool]);

  // 保存画布状态到历史记录
  const saveCanvasState = useCallback(() => {
    if (!canvas || !canvas.toJSON || typeof canvas.toJSON !== "function")
      return;

    try {
      const json = JSON.stringify(canvas.toJSON());
      pushHistory(json);

      // 如果需要，也可以转换为 SVG 并回调
      if (onSvgChange && canvas.toSVG && typeof canvas.toSVG === "function") {
        const svgString = canvas.toSVG();
        onSvgChange(svgString);
      }
    } catch (err) {
      console.error("保存画布状态失败:", err);
    }
  }, [canvas, pushHistory, onSvgChange]);

  // 设置画布事件监听
  const setupCanvasEvents = useCallback(
    (fabricCanvas: fabric.Canvas) => {
      // 选择对象事件
      fabricCanvas.on("selection:created", (e) => {
        setSelectedObjects(e.selected || []);
      });

      fabricCanvas.on("selection:updated", (e) => {
        setSelectedObjects(e.selected || []);
      });

      fabricCanvas.on("selection:cleared", () => {
        setSelectedObjects([]);
      });

      // 对象修改事件
      fabricCanvas.on("object:modified", () => {
        saveCanvasState();
      });

      // 鼠标事件处理绘制工具
      let isDrawing = false;
      let startPointer: { x: number; y: number } | null = null;
      let activeObject: fabric.Object | null = null;

      fabricCanvas.on("mouse:down", (e) => {
        if (currentToolRef.current === "select") return; // 使用 ref 获取最新值

        isDrawing = true;
        startPointer = fabricCanvas.getPointer(e.e);

        switch (
          currentToolRef.current // 使用 ref 获取最新值
        ) {
          case "rectangle":
            activeObject = new fabric.Rect({
              left: startPointer.x,
              top: startPointer.y,
              width: 0,
              height: 0,
              fill: "rgba(100, 150, 255, 0.5)",
              stroke: "#4299e1",
              strokeWidth: 2,
            });
            fabricCanvas.add(activeObject);
            break;

          case "circle":
            activeObject = new fabric.Circle({
              left: startPointer.x,
              top: startPointer.y,
              radius: 0,
              fill: "rgba(255, 100, 150, 0.5)",
              stroke: "#e53e3e",
              strokeWidth: 2,
            });
            fabricCanvas.add(activeObject);
            break;

          case "line":
            activeObject = new fabric.Line(
              [startPointer.x, startPointer.y, startPointer.x, startPointer.y],
              {
                stroke: "#2d3748",
                strokeWidth: 2,
                selectable: true,
              }
            );
            fabricCanvas.add(activeObject);
            break;
        }
      });

      fabricCanvas.on("mouse:move", (e) => {
        if (!isDrawing || !startPointer || !activeObject) return;

        const pointer = fabricCanvas.getPointer(e.e);

        switch (
          currentToolRef.current // 使用 ref 获取最新值
        ) {
          case "rectangle":
            const rect = activeObject as fabric.Rect;
            rect.set({
              width: Math.abs(pointer.x - startPointer.x),
              height: Math.abs(pointer.y - startPointer.y),
              left: Math.min(startPointer.x, pointer.x),
              top: Math.min(startPointer.y, pointer.y),
            });
            break;

          case "circle":
            const circle = activeObject as fabric.Circle;
            const radius =
              Math.sqrt(
                Math.pow(pointer.x - startPointer.x, 2) +
                  Math.pow(pointer.y - startPointer.y, 2)
              ) / 2;
            circle.set({
              radius,
              left: startPointer.x - radius,
              top: startPointer.y - radius,
            });
            break;

          case "line":
            const line = activeObject as fabric.Line;
            line.set({
              x2: pointer.x,
              y2: pointer.y,
            });
            break;
        }

        fabricCanvas.renderAll();
      });

      fabricCanvas.on("mouse:up", () => {
        if (isDrawing) {
          isDrawing = false;
          startPointer = null;
          activeObject = null;
          saveCanvasState();
        }
      });

      // 双击添加文本
      fabricCanvas.on("mouse:dblclick", (e) => {
        if (currentToolRef.current === "text") {
          // 使用 ref 获取最新值
          const pointer = fabricCanvas.getPointer(e.e);
          const text = new fabric.Text("双击编辑文本", {
            left: pointer.x,
            top: pointer.y,
            fontSize: 16,
            fill: "#2d3748",
            fontFamily: "Arial",
          });
          fabricCanvas.add(text);
          fabricCanvas.setActiveObject(text);
          saveCanvasState();
        }
      });
    },
    [setSelectedObjects, saveCanvasState]
  ); // 移除 currentTool 依赖

  // 加载 SVG 到画布
  const loadSVGToCanvas = useCallback(async () => {
    // 加强检查：确保 canvas 存在且有效
    if (!canvas || !canvas.clear || typeof canvas.clear !== "function") {
      console.warn("Canvas 未就绪，跳过 SVG 加载");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 再次检查 canvas（异步操作中可能被清理）
      if (!canvas || !canvas.clear) {
        console.warn("Canvas 在加载过程中被清理");
        return;
      }

      // 清空画布
      canvas.clear();

      // 解析 SVG
      const result = await SVGParser.parseSVGToFabric(svgCode);

      if (!result.success) {
        throw new Error(result.error || "解析失败");
      }

      // 再次检查 canvas（解析是异步的）
      if (!canvas || !canvas.add) {
        console.warn("Canvas 在解析过程中被清理");
        return;
      }

      // 设置画布尺寸
      setCanvasSize(result.canvasSize);

      // 添加对象到画布
      result.objects.forEach((obj) => {
        if (canvas && canvas.add) {
          // 每次添加前都检查
          canvas.add(obj);
        }
      });

      if (canvas && canvas.renderAll) {
        canvas.renderAll();
      }

      // 保存初始状态
      saveCanvasState();
    } catch (err) {
      console.error("SVG 加载失败:", err);
      setError(err instanceof Error ? err.message : "加载 SVG 失败");
    } finally {
      setLoading(false);
    }
  }, [canvas, svgCode, setCanvasSize, saveCanvasState]);

  // 响应式调整画布大小
  const resizeCanvas = useCallback(() => {
    // 使用 ref 获取最新的 canvas 实例
    const currentCanvas = canvasInstanceRef.current;
    if (!currentCanvas || !containerRef.current) return;

    // 检查 canvas 是否有必要的方法
    if (
      !currentCanvas.setDimensions ||
      !currentCanvas.setZoom ||
      !currentCanvas.renderAll
    ) {
      console.warn("Canvas 方法不可用，跳过尺寸调整");
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    const newWidth = Math.max(400, width - 32);
    const newHeight = Math.max(300, height - 32);

    try {
      currentCanvas.setDimensions({ width: newWidth, height: newHeight });

      // 计算合适的缩放比例以适应 SVG 内容
      const scaleX = newWidth / canvasSize.width;
      const scaleY = newHeight / canvasSize.height;
      const scale = Math.min(scaleX, scaleY, 1);

      currentCanvas.setZoom(scale);
      currentCanvas.renderAll();
    } catch (error) {
      console.error("画布尺寸调整失败:", error);
    }
  }, [canvasSize]); // 现在不依赖 canvas state，使用 ref

  // 初始化 Fabric.js 画布
  useEffect(() => {
    if (!canvasRef.current || canvas) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: "white",
      selection: true,
      preserveObjectStacking: true,
    });

    // 设置画布事件监听
    setupCanvasEvents(fabricCanvas);
    setCanvas(fabricCanvas);

    // 清理函数
    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupCanvasEvents, setCanvas]); // 故意不包含 canvas，避免无限循环

  // 响应式调整画布大小
  useEffect(() => {
    if (!canvas || !containerRef.current) return;

    // 立即调整一次
    resizeCanvas();

    // 添加事件监听
    window.addEventListener("resize", resizeCanvas);

    return () => {
      // 清理事件监听
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [canvas, resizeCanvas]);

  // 解析并加载 SVG
  useEffect(() => {
    if (!canvas || !svgCode) return;
    loadSVGToCanvas();
  }, [canvas, svgCode, loadSVGToCanvas]);

  // 工具切换处理
  useEffect(() => {
    if (!canvas) return;

    switch (currentTool) {
      case "select":
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
        break;
      case "rectangle":
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
        break;
      case "circle":
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
        break;
      case "line":
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
        break;
      case "text":
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = "text";
        break;
    }
  }, [canvas, currentTool]);

  if (error) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${className}`}
      >
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full h-full relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>加载中...</span>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg shadow-sm"
      />

      {/* 画布信息显示 */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {Math.round(zoom * 100)}% | {canvasSize.width}x{canvasSize.height}
      </div>
    </div>
  );
}
