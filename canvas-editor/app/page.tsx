"use client";

import FabricCanvas from "@/components/canvas/FabricCanvas";
import MainToolbar from "@/components/toolbar/MainToolbar";
import StatusBar from "@/components/common/StatusBar";

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* 顶部工具栏 */}
      <MainToolbar />

      {/* 主画布区域 */}
      <div className="flex-1 relative">
        <FabricCanvas />
      </div>

      {/* 状态栏 */}
      <StatusBar />
    </div>
  );
}
