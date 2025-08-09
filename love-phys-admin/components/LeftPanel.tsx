// components/CleanLeftPanel.tsx
"use client";

import { GenerationForm } from "./GenerationForm";
import { HistoryList } from "./HistoryList";
import { Sparkles } from "lucide-react";

interface LeftPanelProps {
  activeTab: "generate" | "history";
}

export function LeftPanel({ activeTab }: LeftPanelProps) {
  return (
    <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo和标题 */}
      <div className="p-4 border-b border-gray-200 bg-white/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Physics AI</h1>
            <p className="text-xs text-gray-500">物理动画生成器</p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "generate" ? <GenerationForm /> : <HistoryList />}
      </div>
    </div>
  );
}
