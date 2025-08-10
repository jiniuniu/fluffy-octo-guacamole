// components/ContentViewer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SVGPreview } from "./SVGPreview";
import { ContentHeader } from "./ContentHeader";
import { StateDisplay } from "./StateDisplay";
import { useAppStore, useAppActions } from "@/lib/store";
import { GenerationRecord } from "@/lib/types";
import { downloadFile, copyToClipboard } from "@/lib/utils";

interface ContentViewerProps {
  record: GenerationRecord;
}

export function ContentViewer({ record }: ContentViewerProps) {
  const [currentRecord, setCurrentRecord] = useState(record);

  // 音频控制状态 - 统一在这里管理
  const [showAudio, setShowAudio] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 覆盖层和对话框状态
  const [overlayType, setOverlayType] = useState<
    "explanation" | "tech-info" | null
  >(null);
  const [showModifyDialog, setShowModifyDialog] = useState(false);

  // SVG容器引用，用于全屏
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const store = useAppStore();
  const actions = useAppActions();

  // 当传入的record发生变化时，更新内部状态
  useEffect(() => {
    setCurrentRecord(record);
    // 重置音频状态
    setIsPlaying(false);
  }, [record]);

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentRecord.audio_url) return;

    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentRecord.audio_url, currentRecord.id]); // 使用 id 而不是整个 record

  // 音频播放控制
  const handleTogglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !currentRecord.audio_url) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("音频播放失败:", err);
      setIsPlaying(false);
    }
  };

  // 音量控制
  const handleToggleAudio = () => {
    setShowAudio(!showAudio);
    if (audioRef.current) {
      audioRef.current.muted = showAudio;
    }
  };

  const handleCopyQuestion = async () => {
    const success = await copyToClipboard(currentRecord.question);
    if (!success) {
      // 可以添加错误提示
    }
  };

  const handleRetry = async () => {
    actions.clearError();
    await actions.generateFull(currentRecord.question, currentRecord.model);
  };

  const handleSvgModified = (newSvgCode: string) => {
    setCurrentRecord((prev) => ({
      ...prev,
      svg_code: newSvgCode,
    }));
    actions.updateRecordSvg(currentRecord.id, newSvgCode);
  };

  const handleDownload = () => {
    downloadFile(
      currentRecord.svg_code,
      `physics_animation_${currentRecord.id}.svg`,
      "image/svg+xml"
    );
  };

  const handleDownloadAudio = () => {
    if (currentRecord.audio_url) {
      const link = document.createElement("a");
      link.href = currentRecord.audio_url;
      link.download = `physics_audio_${currentRecord.id}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFullscreen = () => {
    if (!svgContainerRef.current) return;

    if (!document.fullscreenElement) {
      svgContainerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // 失败状态显示
  if (currentRecord.status === "failed") {
    return (
      <StateDisplay
        type="failed-generation"
        title="生成失败"
        question={currentRecord.question}
        errorMessage={currentRecord.error_message || "未知错误，请重试"}
        onRetry={handleRetry}
        onCopyQuestion={handleCopyQuestion}
      />
    );
  }

  // 生成中状态
  if (currentRecord.status === "pending") {
    return (
      <StateDisplay
        type="no-results"
        title="正在生成中..."
        description={currentRecord.question}
        emoji="⏳"
      />
    );
  }

  // 成功状态显示
  return (
    <div className="h-full bg-white overflow-hidden relative">
      {/* 隐藏的音频元素 */}
      {currentRecord.audio_url && (
        <audio
          ref={audioRef}
          src={currentRecord.audio_url}
          preload="metadata"
        />
      )}

      {/* 错误提示 */}
      {store.error && (
        <div className="absolute top-4 left-4 right-4 z-50">
          <Alert variant="destructive">
            <AlertDescription>{store.error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* 修改中状态覆盖层 */}
      {store.asyncOperation.isLoading &&
        store.asyncOperation.type === "modifying" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔧 正在修改动画...
              </h3>
              <p className="text-gray-600 mb-4">
                {store.asyncOperation.currentStep}
              </p>
              <div className="text-sm text-gray-500">
                预计需要 30 秒 - 1 分钟
              </div>
            </div>
          </div>
        )}

      {/* 布局容器 */}
      <div className="h-full flex flex-col">
        {/* 头部区域 */}
        <ContentHeader
          record={currentRecord}
          showAudio={showAudio}
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

        {/* SVG动画区域 */}
        <div ref={svgContainerRef} className="flex-1 px-6 pb-6">
          <SVGPreview
            svgCode={currentRecord.svg_code}
            className="w-full h-full"
            record={currentRecord}
            onSvgModified={handleSvgModified}
            overlayType={overlayType}
            onOverlayTypeChange={setOverlayType}
            showModifyDialog={showModifyDialog}
            onShowModifyDialogChange={setShowModifyDialog}
          />
        </div>
      </div>
    </div>
  );
}
