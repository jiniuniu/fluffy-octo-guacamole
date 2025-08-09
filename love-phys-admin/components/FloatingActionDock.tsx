// components/FloatingActionDock.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  Info,
  Wrench,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Play,
  Pause,
  DownloadIcon,
} from "lucide-react";
import { useState } from "react";
import { GenerationRecord } from "@/lib/types";

interface FloatingActionDockProps {
  record: GenerationRecord;
  showAudio?: boolean;
  isPlaying?: boolean;
  onToggleAudio?: () => void;
  onTogglePlayback?: () => void;
  onShowExplanation: () => void;
  onShowTechInfo: () => void;
  onModifyAnimation: () => void;
  onFullscreen: () => void;
  onDownload: () => void;
  onDownloadAudio?: () => void;
}

export function FloatingActionDock({
  record,
  showAudio = true,
  isPlaying = false,
  onToggleAudio,
  onTogglePlayback,
  onShowExplanation,
  onShowTechInfo,
  onModifyAnimation,
  onFullscreen,
  onDownload,
  onDownloadAudio,
}: FloatingActionDockProps) {
  const [audioExpanded, setAudioExpanded] = useState(false);

  const handleAudioClick = () => {
    if (record.audio_url && onTogglePlayback) {
      onTogglePlayback();
    }
  };

  const handleAudioHover = (hovered: boolean) => {
    if (record.audio_url) {
      setAudioExpanded(hovered);
    }
  };

  const handleDownloadAudio = () => {
    if (onDownloadAudio) {
      onDownloadAudio();
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl px-6 py-3 shadow-xl">
        <div className="flex items-center gap-4">
          {/* 音频控制组 - 有音频时显示 */}
          {record.audio_url && (
            <div
              className="flex items-center gap-2 transition-all duration-300"
              onMouseEnter={() => handleAudioHover(true)}
              onMouseLeave={() => handleAudioHover(false)}
            >
              {/* 主音频按钮 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAudioClick}
                    className="w-10 h-10 p-0 rounded-full hover:bg-blue-100 transition-all duration-200"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Play className="w-5 h-5 text-blue-600 ml-0.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? "暂停音频" : "播放音频"}</p>
                </TooltipContent>
              </Tooltip>

              {/* 展开的音频控制 */}
              <div
                className={`flex items-center gap-2 transition-all duration-300 overflow-hidden ${
                  audioExpanded ? "max-w-24 opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {/* 音量控制 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleAudio}
                      className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {showAudio ? (
                        <Volume2 className="w-4 h-4 text-gray-600" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-gray-600" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showAudio ? "静音" : "取消静音"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* 下载音频 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadAudio}
                      className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>下载音频</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* 分隔线 - 有音频时显示 */}
          {record.audio_url && <div className="w-px h-6 bg-gray-200"></div>}

          {/* 内容操作组 */}
          <div className="flex items-center gap-3">
            {/* 物理解释 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowExplanation}
                  className="w-10 h-10 p-0 rounded-full hover:bg-blue-100 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>物理解释</p>
              </TooltipContent>
            </Tooltip>

            {/* 技术信息 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowTechInfo}
                  className="w-10 h-10 p-0 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Info className="w-5 h-5 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>技术信息</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-200"></div>

          {/* 编辑操作组 */}
          <div className="flex items-center gap-3">
            {/* 修改动画 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onModifyAnimation}
                  className="w-10 h-10 p-0 rounded-full hover:bg-orange-100 transition-colors"
                >
                  <Wrench className="w-5 h-5 text-orange-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>修改动画</p>
              </TooltipContent>
            </Tooltip>

            {/* 全屏模式 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFullscreen}
                  className="w-10 h-10 p-0 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Maximize className="w-5 h-5 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>全屏模式</p>
              </TooltipContent>
            </Tooltip>

            {/* 下载SVG */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownload}
                  className="w-10 h-10 p-0 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-5 h-5 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>下载SVG</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
