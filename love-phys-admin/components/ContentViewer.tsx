// components/ContentViewer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy } from "lucide-react";
import { SVGPreview } from "./SVGPreview";
import { ContentHeader } from "./ContentHeader";
import { useAppStore, useAppActions } from "@/lib/store";
import { GenerationRecord } from "@/lib/types";

interface ContentViewerProps {
  record: GenerationRecord;
}

export function ContentViewer({ record }: ContentViewerProps) {
  const [currentRecord, setCurrentRecord] = useState(record);

  // 音频控制状态
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
  }, [record]);

  const handleCopyQuestion = async () => {
    try {
      await navigator.clipboard.writeText(currentRecord.question);
      // TODO: 添加成功提示
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const handleRetry = async () => {
    actions.clearError();
    await actions.generateFull(currentRecord.question, currentRecord.model);
  };

  // 处理SVG修改完成后的更新
  const handleSvgModified = (newSvgCode: string) => {
    setCurrentRecord((prev) => ({
      ...prev,
      svg_code: newSvgCode,
    }));
    actions.updateRecordSvg(currentRecord.id, newSvgCode);
  };

  // 下载处理
  const handleDownload = () => {
    const blob = new Blob([currentRecord.svg_code], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `physics_animation_${currentRecord.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 下载音频
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
      audioRef.current.muted = showAudio; // 切换静音状态
    }
  };

  // 全屏切换 - 针对 SVG 容器
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
      <div className="h-full bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">生成失败</h3>
          <p className="text-gray-600 mb-2 font-medium">
            {currentRecord.question}
          </p>
          <p className="text-sm text-red-600 mb-6">
            {currentRecord.error_message || "未知错误，请重试"}
          </p>

          <div className="space-y-2">
            <Button onClick={handleRetry} size="sm" className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              重新生成
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyQuestion}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              复制问题
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 生成中状态
  if (currentRecord.status === "pending") {
    return (
      <div className="h-full bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            正在生成中...
          </h3>
          <p className="text-gray-600 mb-6">{currentRecord.question}</p>
          <Button variant="outline" size="sm">
            取消生成
          </Button>
        </div>
      </div>
    );
  }

  // 成功状态显示 - 沉浸式布局
  return (
    <div className="h-full bg-white overflow-hidden relative">
      {/* 隐藏的音频元素 */}
      {currentRecord.audio_url && (
        <audio
          ref={audioRef}
          src={currentRecord.audio_url}
          preload="metadata"
          onEnded={() => setIsPlaying(false)}
          onError={() => setIsPlaying(false)}
        />
      )}

      {/* 错误提示 - 如果有的话 */}
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

      {/* 布局容器 - 避免重叠 */}
      <div className="h-full flex flex-col">
        {/* 头部区域 - 使用新的 ContentHeader 组件 */}
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

        {/* SVG动画区域 - 填充剩余空间，左右padding与标题一致 */}
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
