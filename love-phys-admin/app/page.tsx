// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { VerticalNavigation } from "@/components/VerticalNavigation";
import { LeftPanel } from "@/components/LeftPanel";
import { ContentViewer } from "@/components/ContentViewer";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAppActions, useAppStore } from "@/lib/store";

export default function SimplifiedHomePage() {
  const [activeTab, setActiveTab] = useState<"generate" | "history">(
    "generate"
  );
  const store = useAppStore();
  const actions = useAppActions();

  // 页面加载时初始化数据
  useEffect(() => {
    actions.loadHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 左侧竖直导航栏 */}
      <VerticalNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 中间功能面板 */}
      <LeftPanel activeTab={activeTab} />

      {/* 右侧内容区域 */}
      <div className="flex-1 min-w-0">
        {/* 生成或修改中状态 */}
        {store.asyncOperation.isLoading &&
        (store.asyncOperation.type === "generating" ||
          store.asyncOperation.type === "modifying") ? (
          <LoadingState
            currentStep={store.asyncOperation.currentStep}
            progress={store.asyncOperation.progress}
            type={store.asyncOperation.type}
          />
        ) : store.selectedRecord ? (
          <ContentViewer record={store.selectedRecord} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
