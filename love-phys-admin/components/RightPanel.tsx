// components/RightPanel.tsx
"use client";

import { useAppStore } from "@/lib/store";
import { ContentViewer } from "./ContentViewer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function RightPanel() {
  const store = useAppStore();
  const [elapsedTime, setElapsedTime] = useState(0);

  // 生成开始时重置计时器
  useEffect(() => {
    if (store.isGenerating) {
      setElapsedTime(0);
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [store.isGenerating]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 生成中状态
  if (store.isGenerating) {
    return (
      <div className="h-full bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⏳ 正在生成中...
            </h3>
            <p className="text-gray-600 mb-4">{store.currentStep}</p>
          </div>

          <div className="space-y-3">
            <div className="text-2xl font-mono text-blue-600">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-sm text-gray-500">预计需要 1-2 分钟</p>
          </div>

          <div className="mt-6">
            <Button variant="outline" size="sm">
              取消生成
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 有选中记录时显示内容
  if (store.selectedRecord) {
    return <ContentViewer record={store.selectedRecord} />;
  }

  // 空状态
  return (
    <div className="h-full bg-white flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            开始生成新内容
          </h3>
          <p className="text-gray-600 mb-6">
            在左侧输入物理问题并选择模型，或选择历史记录查看内容
          </p>
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
    </div>
  );
}
