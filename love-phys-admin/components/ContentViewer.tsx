// components/ContentViewer.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Copy,
  ExternalLink,
  Download,
  FileJson,
  Trash2,
  Bot,
  CheckCircle,
  Calendar,
  Hash,
} from "lucide-react";
import { SVGPreview } from "./SVGPreview";
import { useAppStore, useAppActions } from "@/lib/store";
import { GenerationRecord } from "@/lib/types";

interface ContentViewerProps {
  record: GenerationRecord;
}

export function ContentViewer({ record }: ContentViewerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(record);
  const store = useAppStore();
  const actions = useAppActions();

  // 当传入的record发生变化时，更新内部状态
  useEffect(() => {
    setCurrentRecord(record);
  }, [record]);

  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN");
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(currentRecord.explanation);
      // TODO: 添加成功提示
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const handleCopyQuestion = async () => {
    try {
      await navigator.clipboard.writeText(currentRecord.question);
      // TODO: 添加成功提示
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const handleExport = async (format: "svg" | "json") => {
    setIsExporting(true);
    try {
      await actions.exportRecord(currentRecord.id, format);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("确定要删除这条记录吗？")) {
      await actions.deleteRecord(currentRecord.id);
    }
  };

  const handleRetry = async () => {
    actions.clearError();
    await actions.generateFull(currentRecord.question, currentRecord.model);
  };

  // 处理SVG修改完成后的更新
  const handleSvgModified = (newSvgCode: string) => {
    // 更新本地状态
    setCurrentRecord((prev) => ({
      ...prev,
      svg_code: newSvgCode,
    }));

    // 更新全局状态
    actions.updateRecordSvg(currentRecord.id, newSvgCode);
  };

  // 失败状态显示
  if (currentRecord.status === "failed") {
    return (
      <div className="h-full bg-white p-8 flex items-center justify-center">
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
      <div className="h-full bg-white p-8 flex items-center justify-center">
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

      {/* 修改中状态覆盖层 */}
      {store.isModifying && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔧 正在修改动画...
            </h3>
            <p className="text-gray-600 mb-4">{store.currentStep}</p>
            <div className="text-sm text-gray-500">预计需要 30 秒 - 1 分钟</div>
          </div>
        </div>
      )}

      {/* 头部信息 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 pb-4 z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {currentRecord.question}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Bot className="w-4 h-4" />
                {currentRecord.model === "claude"
                  ? "Claude Sonnet 4"
                  : "Qwen Coder Plus"}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                成功
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {getTimeDisplay(currentRecord.created_at)}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Hash className="w-4 h-4" />
                {currentRecord.id.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* 操作下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" disabled={isExporting}>
                <Settings className="w-10 h-10" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCopyQuestion}>
                <Copy className="w-4 h-4 mr-2" />
                复制问题
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyText}>
                <Copy className="w-4 h-4 mr-2" />
                复制解释文本
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  window.open(`/history/${currentRecord.id}`, "_blank")
                }
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                在新页面打开
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson className="w-4 h-4 mr-2" />
                导出JSON格式
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("svg")}>
                <Download className="w-4 h-4 mr-2" />
                导出SVG文件
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除记录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 主要内容 - 只显示SVG动画 */}
      <div className="p-6">
        <SVGPreview
          svgCode={currentRecord.svg_code}
          className="w-full"
          record={currentRecord}
          onSvgModified={handleSvgModified}
        />
      </div>
    </div>
  );
}
