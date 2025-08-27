"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/store/canvas-store";

export function useKeyboard() {
  const { canvas, undo, redo, setCurrentTool } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦点在输入框中，不处理快捷键
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      // Ctrl/Cmd + Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl/Cmd + Y 或 Ctrl/Cmd + Shift + Z: 重做
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete: 删除选中对象
      if (e.key === "Delete" || e.key === "Backspace") {
        if (canvas && canvas.getActiveObject()) {
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            canvas.remove(activeObject);
            canvas.renderAll();
          }
        }
        return;
      }

      // Ctrl/Cmd + A: 全选
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        if (canvas) {
          const objects = canvas.getObjects();
          if (objects.length > 1) {
            canvas.discardActiveObject();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const selection = new (canvas as any).constructor.ActiveSelection(
              objects,
              {
                canvas: canvas,
              }
            );
            canvas.setActiveObject(selection);
            canvas.requestRenderAll();
          }
        }
        return;
      }

      // Escape: 取消选中
      if (e.key === "Escape") {
        if (canvas) {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        setCurrentTool("select");
        return;
      }

      // 工具快捷键
      switch (e.key) {
        case "v":
        case "V":
          setCurrentTool("select");
          break;
        case "r":
        case "R":
          setCurrentTool("rectangle");
          break;
        case "o":
        case "O":
          setCurrentTool("circle");
          break;
        case "t":
        case "T":
          setCurrentTool("text");
          break;
        case "b":
        case "B":
          setCurrentTool("draw");
          break;
        case "l":
        case "L":
          setCurrentTool("line");
          break;
        case "s":
        case "S":
          if (!(e.ctrlKey || e.metaKey)) {
            // 避免与保存快捷键冲突
            setCurrentTool("star");
          }
          break;
      }
    };

    // 添加事件监听
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, undo, redo, setCurrentTool]);
}

// 在主组件中使用这个 hook
export default useKeyboard;
