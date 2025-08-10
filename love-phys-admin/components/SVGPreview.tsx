// components/SVGPreview.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { PhysicsInfoOverlay } from "./PhysicsInfoOverlay";
import { SVGModifyDialog } from "./SVGModifyDialog";
import { GenerationRecord } from "@/lib/types";

interface SVGPreviewProps {
  svgCode: string;
  className?: string;
  record?: GenerationRecord;
  onSvgModified?: (newSvgCode: string) => void;
  // 状态控制属性，用于与 ContentHeader 通信
  overlayType?: "explanation" | "tech-info" | null;
  onOverlayTypeChange?: (type: "explanation" | "tech-info" | null) => void;
  showModifyDialog?: boolean;
  onShowModifyDialogChange?: (show: boolean) => void;
}

export function SVGPreview({
  svgCode,
  className = "",
  record,
  onSvgModified,
  overlayType,
  onOverlayTypeChange,
  showModifyDialog,
  onShowModifyDialogChange,
}: SVGPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [currentSvgCode, setCurrentSvgCode] = useState(svgCode);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 当外部svgCode变化时，更新内部状态
  useEffect(() => {
    setCurrentSvgCode(svgCode);
  }, [svgCode]);

  // 全屏状态监听
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // SVG渲染逻辑
  useEffect(() => {
    if (!containerRef.current || !currentSvgCode) return;

    try {
      setError(null);

      // 清理之前的内容
      containerRef.current.innerHTML = "";

      // 创建一个安全的SVG容器
      const wrapper = document.createElement("div");
      wrapper.innerHTML = currentSvgCode;

      const svgElement = wrapper.querySelector("svg");
      if (!svgElement) {
        throw new Error("Invalid SVG content");
      }

      // 确保SVG有正确的属性
      svgElement.style.width = "100%";
      svgElement.style.height = "auto";
      svgElement.style.display = "block";
      svgElement.style.maxWidth = "100%";

      containerRef.current.appendChild(svgElement);
    } catch (err) {
      console.error("SVG render error:", err);
      setError("SVG渲染失败");
    }
  }, [currentSvgCode]);

  // 处理SVG修改完成
  const handleSvgModified = (newSvgCode: string) => {
    setCurrentSvgCode(newSvgCode);
    if (onSvgModified) {
      onSvgModified(newSvgCode);
    }
  };

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-2xl p-6 ${className}`}
      >
        <div className="text-center">
          <span className="text-2xl mb-2 block">⚠️</span>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentSvgCode) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl p-6 ${className}`}
      >
        <div className="text-center text-gray-500">
          <span className="text-2xl mb-2 block">🎨</span>
          <p className="text-sm">暂无动画内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* SVG容器 */}
      <div
        className={`h-full rounded-2xl border flex items-center justify-center relative overflow-hidden shadow-lg ${
          isFullscreen
            ? "bg-gray-100" // 全屏时使用浅灰色背景
            : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
        }`}
      >
        {/* SVG内容区域 */}
        <div
          ref={containerRef}
          className="p-8 flex items-center justify-center w-full h-full"
        />
      </div>

      {/* 信息覆盖层 */}
      {record && overlayType && onOverlayTypeChange && (
        <div className="absolute top-4 right-4 z-30">
          <PhysicsInfoOverlay
            record={record}
            type={overlayType}
            isOpen={true}
            onClose={() => onOverlayTypeChange(null)}
          />
        </div>
      )}

      {/* 修改动画对话框 */}
      {record && showModifyDialog !== undefined && onShowModifyDialogChange && (
        <SVGModifyDialog
          record={record}
          onModified={handleSvgModified}
          open={showModifyDialog}
          onOpenChange={onShowModifyDialogChange}
        />
      )}
    </div>
  );
}
