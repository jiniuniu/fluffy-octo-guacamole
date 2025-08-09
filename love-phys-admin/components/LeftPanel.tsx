// components/CleanLeftPanel.tsx
"use client";

import { GenerationForm } from "./GenerationForm";
import { HistoryList } from "./HistoryList";

interface LeftPanelProps {
  activeTab: "generate" | "history";
}

export function LeftPanel({ activeTab }: LeftPanelProps) {
  return (
    <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col shadow-sm">
      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "generate" ? <GenerationForm /> : <HistoryList />}
      </div>
    </div>
  );
}
