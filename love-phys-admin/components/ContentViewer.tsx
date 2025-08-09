// components/UpdatedContentViewer.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy } from "lucide-react";
import { SVGPreview } from "./SVGPreview";
import { useAppStore, useAppActions } from "@/lib/store";
import { GenerationRecord } from "@/lib/types";

interface ContentViewerProps {
  record: GenerationRecord;
}

export function ContentViewer({ record }: ContentViewerProps) {
  const [currentRecord, setCurrentRecord] = useState(record);
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

      {/* 主要内容 - SVG动画占据全屏 */}
      <div className="h-full p-8">
        <SVGPreview
          svgCode={currentRecord.svg_code}
          className="w-full h-full"
          record={currentRecord}
          onSvgModified={handleSvgModified}
        />
      </div>

      {/* 问题标题 - 悬浮在顶部 */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
          <h2 className="text-sm font-medium text-gray-900 truncate">
            {currentRecord.question}
          </h2>
        </div>
      </div>
    </div>
  );
}
