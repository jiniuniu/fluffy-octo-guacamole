"use client";

import { useState, useEffect, useCallback } from "react";
import { fabric } from "fabric";
import { useCanvasStore } from "@/store/canvas-store";

export interface FloatingToolbarPosition {
  x: number;
  y: number;
  visible: boolean;
}

const TOOLBAR_HEIGHT = 50;
const TOOLBAR_WIDTH = 280;
const MARGIN = 10;

export function useFloatingToolbar() {
  const { canvas, selectedObject } = useCanvasStore();
  const [position, setPosition] = useState<FloatingToolbarPosition>({
    x: 0,
    y: 0,
    visible: false,
  });

  const calculatePosition = useCallback(
    (object: fabric.Object, canvasInstance: fabric.Canvas) => {
      if (!object || !canvasInstance) {
        return { x: 0, y: 0, visible: false };
      }

      // 获取对象在画布上的边界框
      const objectBounds = object.getBoundingRect();

      // 获取画布元素的位置信息
      const canvasElement = canvasInstance.getElement();
      const canvasRect = canvasElement.getBoundingClientRect();

      // 考虑画布的缩放和偏移
      const zoom = canvasInstance.getZoom();
      const vpt = canvasInstance.viewportTransform || [1, 0, 0, 1, 0, 0];

      // 计算对象在屏幕上的实际位置
      const objectScreenX =
        canvasRect.left + (objectBounds.left + vpt[4]) * zoom;
      const objectScreenY = canvasRect.top + (objectBounds.top + vpt[5]) * zoom;
      const objectScreenWidth = objectBounds.width * zoom;
      const objectScreenHeight = objectBounds.height * zoom;

      // 计算工具栏的理想位置（对象上方居中）
      let toolbarX = objectScreenX + objectScreenWidth / 2;
      let toolbarY = objectScreenY - TOOLBAR_HEIGHT - MARGIN;

      // 边界检查和调整
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 水平边界检查
      if (toolbarX - TOOLBAR_WIDTH / 2 < MARGIN) {
        toolbarX = TOOLBAR_WIDTH / 2 + MARGIN;
      } else if (toolbarX + TOOLBAR_WIDTH / 2 > viewportWidth - MARGIN) {
        toolbarX = viewportWidth - TOOLBAR_WIDTH / 2 - MARGIN;
      }

      // 垂直边界检查 - 如果上方空间不足，显示在下方
      if (toolbarY < MARGIN) {
        toolbarY = objectScreenY + objectScreenHeight + MARGIN;
      }

      // 如果下方也不足，显示在对象右侧
      if (toolbarY + TOOLBAR_HEIGHT > viewportHeight - MARGIN) {
        toolbarY = objectScreenY + objectScreenHeight / 2 - TOOLBAR_HEIGHT / 2;
        toolbarX = objectScreenX + objectScreenWidth + MARGIN;

        // 如果右侧也不足，显示在左侧
        if (toolbarX + TOOLBAR_WIDTH > viewportWidth - MARGIN) {
          toolbarX = objectScreenX - TOOLBAR_WIDTH - MARGIN;
        }
      }

      return {
        x: Math.max(
          MARGIN,
          Math.min(toolbarX, viewportWidth - TOOLBAR_WIDTH - MARGIN)
        ),
        y: Math.max(
          MARGIN,
          Math.min(toolbarY, viewportHeight - TOOLBAR_HEIGHT - MARGIN)
        ),
        visible: true,
      };
    },
    []
  );

  const updatePosition = useCallback(() => {
    if (!canvas || !selectedObject) {
      setPosition({ x: 0, y: 0, visible: false });
      return;
    }

    const newPosition = calculatePosition(selectedObject, canvas);
    setPosition(newPosition);
  }, [canvas, selectedObject, calculatePosition]);

  // 监听选中对象变化
  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  // 监听对象移动和缩放
  useEffect(() => {
    if (!canvas) return;

    const handleObjectMoving = () => updatePosition();
    const handleObjectScaling = () => updatePosition();
    const handleViewportTransform = () => updatePosition();
    const handleResize = () => updatePosition();

    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:scaling", handleObjectScaling);
    canvas.on("object:rotating", handleObjectMoving);
    canvas.on("viewport:transform", handleViewportTransform);
    window.addEventListener("resize", handleResize);

    return () => {
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:scaling", handleObjectScaling);
      canvas.off("object:rotating", handleObjectMoving);
      canvas.off("viewport:transform", handleViewportTransform);
      window.removeEventListener("resize", handleResize);
    };
  }, [canvas, updatePosition]);

  // 延迟隐藏工具栏
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    const timeout = setTimeout(() => {
      if (!selectedObject) {
        setPosition((prev) => ({ ...prev, visible: false }));
      }
    }, 100);

    setHideTimeout(timeout);
  }, [selectedObject, hideTimeout]);

  const cancelHide = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  }, [hideTimeout]);

  return {
    position,
    scheduleHide,
    cancelHide,
    updatePosition,
  };
}
