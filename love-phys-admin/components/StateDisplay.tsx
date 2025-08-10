// components/StateDisplay.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";

interface StateDisplayProps {
  type: "empty" | "error" | "no-results" | "failed-generation";
  title: string;
  description?: string;
  emoji?: string;
  // 失败生成状态的特殊属性
  question?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onCopyQuestion?: () => void;
  // 错误状态的特殊属性
  onRefresh?: () => void;
}

export function StateDisplay({
  type,
  title,
  description,
  emoji,
  question,
  errorMessage,
  onRetry,
  onCopyQuestion,
  onRefresh,
}: StateDisplayProps) {
  const getContent = () => {
    switch (type) {
      case "empty":
        return (
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{emoji || "🎯"}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              {description && (
                <p className="text-gray-600 mb-6">{description}</p>
              )}
            </div>

            <div className="space-y-3 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                <span>输入物理问题</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                <span>选择AI模型</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                <span>生成内容和动画</span>
              </div>
            </div>
          </div>
        );

      case "failed-generation":
        return (
          <div className="text-center max-w-md">
            <div className="mb-4">
              <span className="text-4xl">{emoji || "❌"}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            {question && (
              <p className="text-gray-600 mb-2 font-medium">{question}</p>
            )}
            {errorMessage && (
              <p className="text-sm text-red-600 mb-6">{errorMessage}</p>
            )}

            <div className="space-y-2">
              {onRetry && (
                <Button onClick={onRetry} size="sm" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新生成
                </Button>
              )}
              {onCopyQuestion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyQuestion}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制问题
                </Button>
              )}
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center max-w-md">
            <div className="mb-4">
              <span className="text-4xl">{emoji || "⚠️"}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            {description && <p className="text-gray-600 mb-6">{description}</p>}
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </Button>
            )}
          </div>
        );

      case "no-results":
        return (
          <div className="text-center max-w-md">
            <div className="mb-4">
              <span className="text-4xl">{emoji || "🔍"}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
        );

      default:
        return (
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-gray-600 mt-2">{description}</p>}
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-white flex items-center justify-center p-8">
      {getContent()}
    </div>
  );
}
