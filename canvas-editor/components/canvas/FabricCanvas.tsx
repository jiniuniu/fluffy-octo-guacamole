"use client";

import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useCanvasStore } from "@/store/canvas-store";
import { useKeyboard } from "@/hooks/useKeyboard";
import FloatingToolbar from "../floating/FloatingToolbar";

interface FabricCanvasProps {
  width?: number;
  height?: number;
}

export default function FabricCanvas({
  width = 800,
  height = 600,
}: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setCanvas, setSelectedObject, canvas, saveState } = useCanvasStore();

  // 启用键盘快捷键
  useKeyboard();

  // 初始化画布
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    // 将旋转控制点移动到对象下方
    fabric.Object.prototype.controls.mtr.offsetY = 60;
    fabric.Object.prototype.controls.mtr.y = 0.5;

    setCanvas(fabricCanvas);

    fabricCanvas.on("selection:created", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    fabricCanvas.on("object:modified", saveState);
    fabricCanvas.on("object:added", saveState);
    fabricCanvas.on("object:removed", saveState);

    setTimeout(() => saveState(), 100);

    return () => {
      fabricCanvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCanvas, setSelectedObject, saveState]);

  // 响应窗口大小变化
  useEffect(() => {
    if (!canvas) return;

    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const scale = Math.min(
          containerWidth / width,
          containerHeight / height
        );

        canvas.setDimensions({
          width: width * scale,
          height: height * scale,
        });
        canvas.setZoom(scale);
        canvas.renderAll();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [canvas, width, height]);

  // 拖拽上传功能
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasElement = canvasRef.current;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      canvasElement.style.backgroundColor = "#f0f9ff";
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      canvasElement.style.backgroundColor = "";
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      canvasElement.style.backgroundColor = "";

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert("请拖拽图片文件！");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("图片文件过大，请选择小于 10MB 的文件！");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;

        fabric.Image.fromURL(
          imageUrl,
          (img) => {
            if (!canvas) return;

            const maxSize = 400;
            const scale = Math.min(
              maxSize / (img.width || 1),
              maxSize / (img.height || 1),
              1
            );

            const canvasRect = canvasElement.getBoundingClientRect();
            const pointer = {
              x: e.clientX - canvasRect.left,
              y: e.clientY - canvasRect.top,
            };

            img.set({
              left: pointer.x - (img.width! * scale) / 2,
              top: pointer.y - (img.height! * scale) / 2,
              scaleX: scale,
              scaleY: scale,
              cornerColor: "#4F46E5",
              cornerStyle: "circle",
              transparentCorners: false,
              cornerSize: 10,
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();

            setTimeout(() => saveState(), 100);
          },
          {
            crossOrigin: "anonymous",
          }
        );
      };

      reader.readAsDataURL(file);
    };

    canvasElement.addEventListener("dragover", handleDragOver);
    canvasElement.addEventListener("dragleave", handleDragLeave);
    canvasElement.addEventListener("drop", handleDrop);

    return () => {
      canvasElement.removeEventListener("dragover", handleDragOver);
      canvasElement.removeEventListener("dragleave", handleDragLeave);
      canvasElement.removeEventListener("drop", handleDrop);
    };
  }, [canvas, saveState]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="block" />
      </div>

      <FloatingToolbar />
    </div>
  );
}
