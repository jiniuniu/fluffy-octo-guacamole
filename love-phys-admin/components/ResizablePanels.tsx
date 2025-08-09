// components/ResizablePanels.tsx
"use client";

import { useState, useRef, useEffect } from "react";

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidthPercent?: number;
  className?: string;
}

export function ResizablePanels({
  leftPanel,
  rightPanel,
  initialLeftWidth = 400,
  minLeftWidth = 280,
  maxLeftWidthPercent = 0.6,
  className = "",
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 处理拖拽中
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      // 限制最小和最大宽度
      const maxWidth = containerRect.width * maxLeftWidthPercent;

      if (newWidth >= minLeftWidth && newWidth <= maxWidth) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, minLeftWidth, maxLeftWidthPercent]);

  return (
    <div ref={containerRef} className={`flex h-full relative ${className}`}>
      {/* 左侧面板 */}
      <div className="flex-shrink-0" style={{ width: leftWidth }}>
        {leftPanel}
      </div>

      {/* 可拖拽的分隔线 */}
      <div
        className="relative flex items-center justify-center w-1 bg-gray-300 cursor-col-resize group"
        onMouseDown={handleMouseDown}
      >
        {/* 中间的拖拽点 */}
        <div
          className={`absolute w-3 h-8 -ml-1 transition-all duration-200 cursor-col-resize ${
            isDragging
              ? "bg-blue-500 shadow-lg"
              : "bg-gray-400 group-hover:bg-gray-500"
          } rounded-full`}
        ></div>
      </div>

      {/* 右侧面板 */}
      <div className="flex-1 min-w-0">{rightPanel}</div>
    </div>
  );
}
