// components/SVGPreview.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { SVGModifyDialog } from "./SVGModifyDialog";
import { GenerationRecord } from "@/lib/types";

interface SVGPreviewProps {
  svgCode: string;
  className?: string;
  record?: GenerationRecord; // 新增：传入记录信息用于修改功能
  onSvgModified?: (newSvgCode: string) => void; // 新增：修改完成的回调
}

export function SVGPreview({
  svgCode,
  className = "",
  record,
  onSvgModified,
}: SVGPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [currentSvgCode, setCurrentSvgCode] = useState(svgCode);
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
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg p-8 ${className}`}
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
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-8 ${className}`}
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
      <div
        ref={containerRef}
        className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center min-h-[300px] w-full overflow-hidden relative"
      />

      {/* Fix Me 按钮 - 只在有记录且状态为成功时显示 */}
      {record && record.status === "success" && (
        <SVGModifyDialog record={record} onModified={handleSvgModified} />
      )}
    </div>
  );
}
