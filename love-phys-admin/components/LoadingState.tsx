// components/LoadingState.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  currentStep: string;
  progress: number;
  type: "generating" | "modifying" | "loading" | null;
}

export function LoadingState({
  currentStep,
  progress,
  type,
}: LoadingStateProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // 计时器
  useEffect(() => {
    if (type === "generating" || type === "modifying") {
      setElapsedTime(0);
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [type]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getLoadingConfig = () => {
    switch (type) {
      case "generating":
        return {
          icon: "⏳",
          title: "正在生成中...",
          description: "预计需要 1-2 分钟",
          showTimer: true,
        };
      case "modifying":
        return {
          icon: "🔧",
          title: "正在修改动画...",
          description: "预计需要 30 秒 - 1 分钟",
          showTimer: true,
        };
      case "loading":
        return {
          icon: "📚",
          title: "加载中...",
          description: "请稍候",
          showTimer: false,
        };
      default:
        return {
          icon: "⏳",
          title: "处理中...",
          description: "请稍候",
          showTimer: false,
        };
    }
  };

  const config = getLoadingConfig();

  return (
    <div className="h-full bg-white flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {config.icon} {config.title}
          </h3>
          <p className="text-gray-600 mb-4">{currentStep}</p>
        </div>

        {config.showTimer && (
          <div className="space-y-3">
            <div className="text-2xl font-mono text-blue-600">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-sm text-gray-500">{config.description}</p>

            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <Button variant="outline" size="sm">
            取消{type === "generating" ? "生成" : "操作"}
          </Button>
        </div>
      </div>
    </div>
  );
}
