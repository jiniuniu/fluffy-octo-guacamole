// components/VerticalNavigation.tsx
"use client";

import { Settings } from "lucide-react";

interface VerticalNavigationProps {
  activeTab: "generate" | "history";
  onTabChange: (tab: "generate" | "history") => void;
}

export function VerticalNavigation({
  activeTab,
  onTabChange,
}: VerticalNavigationProps) {
  return (
    <div className="w-12 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center py-4 shadow-lg">
      {/* Logo区域 */}
      <div className="mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white text-lg font-bold">P</span>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="space-y-4">
        <button
          onClick={() => onTabChange("generate")}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
            activeTab === "generate"
              ? "bg-blue-500 text-white shadow-lg scale-110"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
          title="生成新内容"
        >
          <span className="text-lg">📝</span>
        </button>

        <button
          onClick={() => onTabChange("history")}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
            activeTab === "history"
              ? "bg-purple-500 text-white shadow-lg scale-110"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
          title="历史记录"
        >
          <span className="text-lg">📚</span>
        </button>
      </div>

      {/* 底部设置 */}
      <div className="mt-auto">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
