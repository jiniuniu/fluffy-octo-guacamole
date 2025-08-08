// components/SVGPreview.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { CompactActionButtons } from "./CompactActionButtons";
import { PhysicsInfoOverlay } from "./PhysicsInfoOverlay";
import { AudioPlayer } from "./AudioPlayer";
import { GenerationRecord } from "@/lib/types";

interface SVGPreviewProps {
  svgCode: string;
  className?: string;
  record?: GenerationRecord;
  onSvgModified?: (newSvgCode: string) => void;
}

export function SVGPreview({
  svgCode,
  className = "",
  record,
  onSvgModified,
}: SVGPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [currentSvgCode, setCurrentSvgCode] = useState(svgCode);
  const [overlayType, setOverlayType] = useState<
    "explanation" | "tech-info" | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 当外部svgCode变化时，更新内部状态
  useEffect(() => {
    setCurrentSvgCode(svgCode);
  }, [svgCode]);

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
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
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
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <div className="text-center text-gray-500">
          <span className="text-2xl mb-2 block">🎨</span>
          <p className="text-sm">暂无动画内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full relative ${className}`}>
      {/* SVG容器 - 相对定位，为音频播放器提供定位基准 */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* SVG内容区域 */}
        <div
          ref={containerRef}
          className="p-8 flex items-center justify-center min-h-[320px] w-full"
        />

        {/* 音频播放器 - 绝对定位覆盖在SVG上层 */}
        {record && record.audio_url && (
          <div className="absolute bottom-20 left-10 right-10 z-10">
            <AudioPlayer record={record} />
          </div>
        )}
      </div>

      {/* 右上角操作按钮组 */}
      {record && record.status === "success" && (
        <CompactActionButtons
          record={record}
          onShowExplanation={() => setOverlayType("explanation")}
          onShowTechInfo={() => setOverlayType("tech-info")}
          onSvgModified={handleSvgModified}
        />
      )}

      {/* 信息覆盖层 - 弹窗样式 */}
      {record && overlayType && (
        <PhysicsInfoOverlay
          record={record}
          type={overlayType}
          isOpen={true}
          onClose={() => setOverlayType(null)}
        />
      )}
    </div>
  );
}
