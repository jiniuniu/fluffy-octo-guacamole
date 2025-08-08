"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SVGPreviewProps {
  svgCode: string;
  className?: string;
}

export function SVGPreview({ svgCode, className = "" }: SVGPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgCode) return;

    try {
      setError(null);

      // 清理之前的内容
      containerRef.current.innerHTML = "";

      // 创建一个安全的SVG容器
      const wrapper = document.createElement("div");
      wrapper.innerHTML = svgCode;

      const svgElement = wrapper.querySelector("svg");
      if (!svgElement) {
        throw new Error("Invalid SVG content");
      }

      // 确保SVG有正确的属性
      svgElement.style.width = "100%";
      svgElement.style.height = "auto";
      svgElement.style.maxHeight = "400px";

      containerRef.current.appendChild(svgElement);

      // 控制动画播放/暂停
      if (!isPlaying) {
        const animations = svgElement.querySelectorAll(
          "animate, animateTransform"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animations.forEach((anim: any) => {
          anim.pauseAnimations?.();
        });
      }
    } catch (err) {
      console.error("SVG render error:", err);
      setError("SVG渲染失败");
    }
  }, [svgCode, isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);

    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector("svg");
      if (svgElement) {
        const animations = svgElement.querySelectorAll(
          "animate, animateTransform"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animations.forEach((anim: any) => {
          if (isPlaying) {
            anim.pauseAnimations?.();
          } else {
            anim.unpauseAnimations?.();
          }
        });
      }
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

  if (!svgCode) {
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
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center min-h-[300px]"
      />

      <div className="absolute top-2 right-2 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={togglePlay}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isPlaying ? "⏸️" : "▶️"}
        </Button>
      </div>
    </div>
  );
}
