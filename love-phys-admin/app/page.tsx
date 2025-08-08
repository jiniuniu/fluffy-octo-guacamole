// app/page.tsx
"use client";

import { useEffect } from "react";
import { LeftPanel } from "@/components/LeftPanel";
import { RightPanel } from "@/components/RightPanel";
import { useAppActions } from "@/lib/store";

export default function HomePage() {
  const actions = useAppActions();

  // 页面加载时初始化数据
  useEffect(() => {
    actions.loadHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🧪</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">
                Love Phys Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-sm">👤</span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-sm">⚙️</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容 - 双屏布局 */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* 左侧操作面板 */}
        <div className="w-80 flex-shrink-0">
          <LeftPanel />
        </div>

        {/* 右侧渲染面板 */}
        <div className="flex-1 border-l border-gray-200">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
