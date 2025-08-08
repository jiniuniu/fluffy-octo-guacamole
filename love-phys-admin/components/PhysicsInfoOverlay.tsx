// components/PhysicsInfoOverlay.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Info,
  X,
  Bot,
  Calendar,
  Hash,
  FileText,
  Database,
  Clock,
} from "lucide-react";
import { GenerationRecord } from "@/lib/types";

interface PhysicsInfoOverlayProps {
  record: GenerationRecord;
  type: "explanation" | "tech-info";
  isOpen: boolean;
  onClose: () => void;
}

export function PhysicsInfoOverlay({
  record,
  type,
  isOpen,
  onClose,
}: PhysicsInfoOverlayProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    return type === "explanation" ? (
      <BookOpen className="w-4 h-4" />
    ) : (
      <Info className="w-4 h-4" />
    );
  };

  const getTitle = () => {
    return type === "explanation" ? "物理解释" : "技术信息";
  };

  const renderContent = () => {
    if (type === "explanation") {
      return (
        <div className="space-y-3">
          {/* 物理解释内容 - 移除原始问题部分 */}
          <div className="bg-white border border-gray-200 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-900 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                详细解释
              </h4>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                {record.explanation.length} 字符
              </Badge>
            </div>
            <ScrollArea className="h-40">
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {record.explanation}
              </p>
            </ScrollArea>
          </div>

          {/* 模型信息 */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Bot className="w-3 h-3" />
            <span>
              由{" "}
              {record.model === "claude"
                ? "Claude Sonnet 4"
                : "Qwen Coder Plus"}{" "}
              生成
            </span>
          </div>
        </div>
      );
    }

    // 技术信息
    return (
      <div className="space-y-3">
        {/* 基础信息 */}
        <div className="bg-white border border-gray-200 rounded-md p-3">
          <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1">
            <Database className="w-3 h-3" />
            基础信息
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                模型
              </span>
              <Badge
                variant={record.model === "claude" ? "default" : "secondary"}
                className="text-xs px-1.5 py-0.5 h-5"
              >
                {record.model === "claude" ? "Claude" : "Qwen"}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                时间
              </span>
              <span className="text-xs font-medium text-gray-900">
                {new Date(record.created_at).toLocaleDateString("zh-CN")}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                ID
              </span>
              <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                {record.id.slice(0, 8)}
              </code>
            </div>
          </div>
        </div>

        {/* 内容统计 */}
        <div className="bg-white border border-gray-200 rounded-md p-3">
          <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            内容统计
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-sm font-bold text-blue-600">
                {record.explanation.length}
              </div>
              <div className="text-xs text-blue-700">解释字符</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-sm font-bold text-green-600">
                {(record.svg_code.length / 1024).toFixed(1)}K
              </div>
              <div className="text-xs text-green-700">SVG大小</div>
            </div>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            状态
          </span>
          <Badge
            variant={
              record.status === "success"
                ? "default"
                : record.status === "failed"
                  ? "destructive"
                  : "secondary"
            }
            className="text-xs px-1.5 py-0.5 h-5"
          >
            {record.status === "success" && "✅ 成功"}
            {record.status === "failed" && "❌ 失败"}
            {record.status === "pending" && "⏳ 生成中"}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute top-2 right-14 z-30 bg-white rounded-lg border border-gray-200 shadow-lg w-80 max-h-96">
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="text-sm font-medium text-gray-900">{getTitle()}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="p-3 max-h-80 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}
