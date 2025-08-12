// components/ContentHeader.tsx
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
  Sparkles,
  Zap,
  Mic,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { GenerationRecord } from "@/lib/types";

interface ContentHeaderProps {
  record: GenerationRecord;
  // 音频控制
  showAudio?: boolean;
  isPlaying?: boolean;
  onToggleAudio?: () => void;
  onTogglePlayback?: () => void;
  onDownloadAudio?: () => void;
  // 内容操作
  onShowExplanation: () => void;
  onShowTechInfo: () => void;
  onModifyAnimation: () => void;
  onFullscreen: () => void;
  onDownload: () => void;
}

export function ContentHeader({
  record,
  showAudio = true,
  isPlaying = false,
  onToggleAudio,
  onTogglePlayback,
  onDownloadAudio,
  onShowExplanation,
  onShowTechInfo,
  onModifyAnimation,
  onFullscreen,
  onDownload,
}: ContentHeaderProps) {
  const getModelIcon = (model: string) => {
    return model === "claude" ? (
      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
    ) : (
      <Zap className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  const getSvgTypeIcon = (svgType?: string) => {
    return svgType === "static" ? (
      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <Play className="w-3.5 h-3.5 text-green-600" />
    );
  };

  const getSvgTypeName = (svgType?: string) => {
    return svgType === "static" ? "静态" : "动态";
  };

  const getModelName = (model: string) => {
    return model === "claude" ? "Claude" : "Qwen";
  };

  return (
    <TooltipProvider>
      <div className="flex-shrink-0 p-6 pb-3">
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            {/* 左侧信息区域 */}
            <div className="flex-1 min-w-0 pr-6">
              <h2 className="text-lg font-semibold text-gray-900 truncate mb-2">
                {record.question}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                {/* 模型信息 */}
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {getModelIcon(record.model)}
                  <span>{getModelName(record.model)}</span>
                </div>
                {/* SVG 类型信息 */}
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  {getSvgTypeIcon(record.svg_type)}
                  <span>{getSvgTypeName(record.svg_type)}</span>
                </div>
                {/* 音频和时间信息 */}
                {record.audio_url && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Mic className="w-3.5 h-3.5 text-orange-600" />
                    <span>音频</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(record.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
            </div>

            {/* 右侧操作区域 */}
            <div className="flex items-center gap-2">
              {/* 音频控制组 - 有音频时显示 */}
              {record.audio_url && (
                <>
                  <div className="flex items-center gap-1 bg-white/40 backdrop-blur-sm rounded-full px-2 py-1">
                    {/* 主音频按钮 */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onTogglePlayback}
                          className="w-8 h-8 p-0 rounded-full hover:bg-blue-100 transition-all duration-200"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Play className="w-4 h-4 text-blue-600 ml-0.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isPlaying ? "暂停音频" : "播放音频"}</p>
                      </TooltipContent>
                    </Tooltip>

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
                          onClick={onDownloadAudio}
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

                  {/* 分隔线 */}
                  <div className="w-px h-6 bg-gray-400/60"></div>
                </>
              )}

              {/* 内容操作组 */}
              <div className="flex items-center gap-1 bg-white/40 backdrop-blur-sm rounded-full px-2 py-1">
                {/* 物理解释 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShowExplanation}
                      className="w-8 h-8 p-0 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
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
                      className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Info className="w-4 h-4 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>技术信息</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* 分隔线 */}
              <div className="w-px h-6 bg-gray-400/60"></div>

              {/* 编辑操作组 */}
              <div className="flex items-center gap-1 bg-white/40 backdrop-blur-sm rounded-full px-2 py-1">
                {/* 修改动画 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onModifyAnimation}
                      className="w-8 h-8 p-0 rounded-full hover:bg-orange-100 transition-colors"
                    >
                      <Wrench className="w-4 h-4 text-orange-600" />
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
                      className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Maximize className="w-4 h-4 text-gray-600" />
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
                      className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>下载SVG</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
