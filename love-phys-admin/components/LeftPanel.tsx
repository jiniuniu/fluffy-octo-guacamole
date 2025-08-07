"use client";

import { useState } from "react";
import { GenerationForm } from "./GenerationForm";
import { HistoryList } from "./HistoryList";

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<"generate" | "history">(
    "generate"
  );

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Tab 切换 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "generate"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📝 新建生成
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "history"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📚 历史记录
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "generate" ? <GenerationForm /> : <HistoryList />}
      </div>
    </div>
  );
}
