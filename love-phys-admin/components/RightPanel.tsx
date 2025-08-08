// components/RightPanel.tsx
"use client";

import { useAppStore } from "@/lib/store";
import { ContentViewer } from "./ContentViewer";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

export function RightPanel() {
  const store = useAppStore();

  // 生成或修改中状态
  if (
    store.asyncOperation.isLoading &&
    (store.asyncOperation.type === "generating" ||
      store.asyncOperation.type === "modifying")
  ) {
    return (
      <LoadingState
        currentStep={store.asyncOperation.currentStep}
        progress={store.asyncOperation.progress}
        type={store.asyncOperation.type}
      />
    );
  }

  // 有选中记录时显示内容
  if (store.selectedRecord) {
    return <ContentViewer record={store.selectedRecord} />;
  }

  // 空状态
  return <EmptyState />;
}
