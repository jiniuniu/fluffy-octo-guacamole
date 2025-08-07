"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GenerationRecord } from "@/lib/types";

interface ContentViewerProps {
  record: GenerationRecord;
}

export function ContentViewer({ record }: ContentViewerProps) {
  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN");
  };

  if (record.status === "failed") {
    return (
      <div className="h-full bg-white p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">生成失败</h3>
          <p className="text-gray-600 mb-2">{record.question}</p>
          <p className="text-sm text-red-600 mb-6">
            {record.error_message || "未知错误"}
          </p>
          <Button size="sm">🔄 重新生成</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* 头部信息 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              📋 {record.question}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                🤖{" "}
                {record.model === "claude"
                  ? "Claude Sonnet 4"
                  : "Qwen Coder Plus"}
              </span>
              <span>✅ 成功</span>
              <span>📅 {getTimeDisplay(record.created_at)}</span>
              <span>ID: {record.id}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              复制
            </Button>
            <Button variant="outline" size="sm">
              导出
            </Button>
            <Button variant="outline" size="sm">
              删除
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* 物理解释 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              📝 物理解释
            </h3>
            <Button variant="ghost" size="sm">
              复制文本
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {record.explanation}
            </p>
          </div>
        </div>

        <Separator />

        {/* SVG动画 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              🎨 SVG动画
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                播放
              </Button>
              <Button variant="ghost" size="sm">
                暂停
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center min-h-[300px]">
            {/* 这里后续会渲染真实的SVG */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-white text-xl">🌈</span>
              </div>
              <p className="text-gray-600">SVG动画预览</p>
              <p className="text-xs text-gray-500 mt-1">
                {record.svg_code.length} 字符
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm">
              下载SVG文件
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
