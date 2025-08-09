// app/page.tsx
"use client";

import { useEffect } from "react";
import { LeftPanel } from "@/components/LeftPanel";
import { RightPanel } from "@/components/RightPanel";
import { ResizablePanels } from "@/components/ResizablePanels";
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
      {/* 主体内容 - 可调整大小的双屏布局 */}
      <ResizablePanels
        leftPanel={<LeftPanel />}
        rightPanel={<RightPanel />}
        initialLeftWidth={400}
        minLeftWidth={280}
        maxLeftWidthPercent={0.6}
        className="h-screen"
      />
    </div>
  );
}
