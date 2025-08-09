// components/ContentViewer.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Eye, EyeOff } from "lucide-react";
import { SVGPreview } from "./SVGPreview";
import { useAppStore, useAppActions } from "@/lib/store";
import { GenerationRecord } from "@/lib/types";

interface ContentViewerProps {
  record: GenerationRecord;
}

export function ContentViewer({ record }: ContentViewerProps) {
  const [currentRecord, setCurrentRecord] = useState(record);
  const [showDock, setShowDock] = useState(true); // 新增：控制dock显示状态
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
        {/* 标题区域 - 固定高度，不重叠 */}
        <div className="flex-shrink-0 p-6 pb-3">
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">
                  {currentRecord.question}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>
                      {currentRecord.model === "claude" ? "Claude" : "Qwen"}
                    </span>
                  </div>
                  {currentRecord.audio_url && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span>🎤</span>
                      <span>音频</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(currentRecord.created_at).toLocaleDateString(
                      "zh-CN"
                    )}
                  </div>
                </div>
              </div>

              {/* 控制面板显示/隐藏按钮 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDock(!showDock)}
                  className="h-8 w-8 p-0 bg-white/40 hover:bg-white/60 border border-white/40 backdrop-blur-sm"
                  title={showDock ? "隐藏控制面板" : "显示控制面板"}
                >
                  {showDock ? (
                    <EyeOff className="w-4 h-4 text-gray-700" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-700" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* SVG动画区域 - 填充剩余空间，左右padding与标题一致 */}
        <div className="flex-1 px-6 pb-6">
          <SVGPreview
            svgCode={currentRecord.svg_code}
            className="w-full h-full"
            record={currentRecord}
            onSvgModified={handleSvgModified}
            showDock={showDock}
          />
        </div>
      </div>
    </div>
  );
}
