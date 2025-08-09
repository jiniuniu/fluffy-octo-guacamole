"use client";

import { useState } from "react";
import { GenerationForm } from "./GenerationForm";
import { HistoryList } from "./HistoryList";
import { Plus, History, Sparkles } from "lucide-react";

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<"generate" | "history">(
    "generate"
  );

  return (
    <div className="h-full bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Tab 切换 */}
      <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex bg-gray-100/80 rounded-xl p-1.5 shadow-inner">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "generate"
                ? "bg-white text-blue-700 shadow-md ring-1 ring-blue-100 transform scale-[0.98]"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
            }`}
          >
            {activeTab === "generate" ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>新建生成</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "history"
                ? "bg-white text-purple-700 shadow-md ring-1 ring-purple-100 transform scale-[0.98]"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
            }`}
          >
            <History className="w-4 h-4" />
            <span>历史记录</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-transparent to-gray-50/30">
        {activeTab === "generate" ? <GenerationForm /> : <HistoryList />}
      </div>
    </div>
  );
}
