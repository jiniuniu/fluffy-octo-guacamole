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
      {/* 主体内容 - 双屏布局，占满全屏 */}
      <div className="flex h-screen">
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
