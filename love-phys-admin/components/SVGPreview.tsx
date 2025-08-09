/* eslint-disable @typescript-eslint/no-unused-vars */
// components/SVGPreview.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { FloatingActionDock } from "./FloatingActionDock";
import { PhysicsInfoOverlay } from "./PhysicsInfoOverlay";
import { SVGModifyDialog } from "./SVGModifyDialog";
import { GenerationRecord } from "@/lib/types";

interface SVGPreviewProps {
  svgCode: string;
  className?: string;
  record?: GenerationRecord;
  onSvgModified?: (newSvgCode: string) => void;
  showDock?: boolean; // 新增：控制dock显示
}

export function SVGPreview({
  svgCode,
  className = "",
  record,
  onSvgModified,
  showDock = true, // 默认显示dock
}: SVGPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [currentSvgCode, setCurrentSvgCode] = useState(svgCode);
  const [overlayType, setOverlayType] = useState<
    "explanation" | "tech-info" | null
  >(null);
  const [showAudio, setShowAudio] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);

  // 音频控制状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 音频播放逻辑 - 参考 AudioPlayer
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !record?.audio_url) return;

    const handleLoadStart = () => setAudioError(null);
    const handleCanPlay = () => setAudioError(null);
    const handleError = () => {
      setAudioError("音频加载失败");
      setIsPlaying(false);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [record?.audio_url]);

  // 控制音频音量
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

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

  // 切换音频播放器显示状态
  const handleToggleAudioVisibility = () => {
    setShowAudio(!showAudio);
  };

  // 全屏切换
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 下载处理
  const handleDownload = () => {
    const blob = new Blob([currentSvgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `physics_animation_${record?.id || "download"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 音频播放控制
  const handleTogglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !record?.audio_url) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setAudioError("播放失败");
      setIsPlaying(false);
    }
  };

  // 音量控制
  const handleToggleAudio = () => {
    setIsMuted(!isMuted);
  };

  // 下载音频
  const handleDownloadAudio = () => {
    if (record?.audio_url) {
      const link = document.createElement("a");
      link.href = record.audio_url;
      link.download = `physics_audio_${record.id}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      {/* 隐藏的音频元素 */}
      {record?.audio_url && (
        <audio ref={audioRef} src={record.audio_url} preload="metadata" />
      )}

      {/* SVG容器 - 根据全屏状态调整背景 */}
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

      {/* 悬浮操作dock - 只在showDock为true且状态为success时显示 */}
      {record && record.status === "success" && showDock && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <FloatingActionDock
            record={record}
            showAudio={!isMuted}
            isPlaying={isPlaying}
            onToggleAudio={handleToggleAudio}
            onTogglePlayback={handleTogglePlayback}
            onShowExplanation={() => setOverlayType("explanation")}
            onShowTechInfo={() => setOverlayType("tech-info")}
            onModifyAnimation={() => setShowModifyDialog(true)}
            onFullscreen={handleFullscreen}
            onDownload={handleDownload}
            onDownloadAudio={handleDownloadAudio}
          />
        </div>
      )}

      {/* 信息覆盖层 - 弹窗样式 */}
      {record && overlayType && (
        <div className="absolute top-4 right-4 z-30">
          <PhysicsInfoOverlay
            record={record}
            type={overlayType}
            isOpen={true}
            onClose={() => setOverlayType(null)}
          />
        </div>
      )}

      {/* 修改动画对话框 */}
      {record && (
        <SVGModifyDialog
          record={record}
          onModified={handleSvgModified}
          open={showModifyDialog}
          onOpenChange={setShowModifyDialog}
        />
      )}
    </div>
  );
}
