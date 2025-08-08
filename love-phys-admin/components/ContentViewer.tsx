// components/ContentViewer.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SVGPreview } from "./SVGPreview";
import { useAppStore, useAppActions } from "@/lib/store";
import { GenerationRecord } from "@/lib/types";

interface ContentViewerProps {
  record: GenerationRecord;
}

export function ContentViewer({ record }: ContentViewerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const store = useAppStore();
  const actions = useAppActions();

  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN");
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(record.explanation);
      // TODO: 添加成功提示
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const handleCopyQuestion = async () => {
    try {
      await navigator.clipboard.writeText(record.question);
      // TODO: 添加成功提示
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const handleExport = async (format: "svg" | "json") => {
    setIsExporting(true);
    try {
      await actions.exportRecord(record.id, format);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("确定要删除这条记录吗？")) {
      await actions.deleteRecord(record.id);
    }
  };

  const handleRetry = async () => {
    actions.clearError();
    await actions.generateFull(record.question, record.model);
  };

  const handleRegenerateBasedOn = async () => {
    actions.clearError();
    await actions.generateFull(record.question, record.model);
  };

  // 失败状态显示
  if (record.status === "failed") {
    return (
      <div className="h-full bg-white p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">生成失败</h3>
          <p className="text-gray-600 mb-2 font-medium">{record.question}</p>
          <p className="text-sm text-red-600 mb-6">
            {record.error_message || "未知错误，请重试"}
          </p>

          <div className="space-y-2">
            <Button onClick={handleRetry} size="sm" className="w-full">
              🔄 重新生成
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyQuestion}
              className="w-full"
            >
              📋 复制问题
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 生成中状态
  if (record.status === "pending") {
    return (
      <div className="h-full bg-white p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            正在生成中...
          </h3>
          <p className="text-gray-600 mb-6">{record.question}</p>
          <Button variant="outline" size="sm">
            取消生成
          </Button>
        </div>
      </div>
    );
  }

  // 成功状态显示
  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* 错误提示 */}
      {store.error && (
        <div className="p-4 border-b border-red-200">
          <Alert variant="destructive">
            <AlertDescription>{store.error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* 头部信息 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              📋 {record.question}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>
                🤖{" "}
                {record.model === "claude"
                  ? "Claude Sonnet 4"
                  : "Qwen Coder Plus"}
              </span>
              <span>✅ 成功</span>
              <span>📅 {getTimeDisplay(record.created_at)}</span>
              <span className="font-mono">ID: {record.id.slice(0, 8)}</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleCopyQuestion}>
              📋 复制问题
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              disabled={isExporting}
            >
              📄 导出JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("svg")}
              disabled={isExporting}
            >
              🎨 导出SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              🗑️ 删除
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* 快速操作 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            🔄 快速操作
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateBasedOn}
            >
              基于此问题重新生成
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyQuestion}>
              复制问题到新生成
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/history/${record.id}`, "_blank")}
            >
              在新页面打开
            </Button>
          </div>
        </div>

        {/* 物理解释 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              📝 物理解释
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopyText}>
                📋 复制文本
              </Button>
              <span className="text-xs text-gray-500 self-center">
                {record.explanation.length} 字符
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {record.explanation}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* SVG动画 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              🎨 SVG动画预览
            </h3>
            <div className="flex gap-2">
              <span className="text-xs text-gray-500 self-center">
                {(record.svg_code.length / 1024).toFixed(1)} KB
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport("svg")}
                disabled={isExporting}
              >
                💾 下载SVG文件
              </Button>
            </div>
          </div>

          <SVGPreview svgCode={record.svg_code} className="w-full" />
        </div>

        {/* 技术信息 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            📊 技术信息
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">生成模型:</span>
              <span className="ml-2 font-medium">
                {record.model === "claude"
                  ? "Claude Sonnet 4"
                  : "Qwen Coder Plus"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">创建时间:</span>
              <span className="ml-2 font-medium">
                {getTimeDisplay(record.created_at)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">解释长度:</span>
              <span className="ml-2 font-medium">
                {record.explanation.length} 字符
              </span>
            </div>
            <div>
              <span className="text-gray-600">SVG大小:</span>
              <span className="ml-2 font-medium">
                {(record.svg_code.length / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
