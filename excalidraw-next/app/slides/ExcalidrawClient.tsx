"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { InitialData } from "@/lib/types";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export default function ExcalidrawClient({
  initialData,
}: {
  initialData?: InitialData;
}) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const save = () => {
    if (!apiRef.current) return;
    const elements = apiRef.current.getSceneElements();
    const appState = apiRef.current.getAppState();
    const files = apiRef.current.getFiles();
    console.log("保存场景", { elements, appState, files });
    apiRef.current.setToast({ message: "已保存到控制台", duration: 2000 }); // 小提示
  };

  return (
    <div style={{ height: "100vh" }}>
      <Excalidraw
        excalidrawAPI={(api) => (apiRef.current = api)}
        initialData={initialData}
        // ✅ 把按钮渲染到画布右上角（桌面和移动端都可）
        renderTopRightUI={(isMobile) => (
          <button
            onClick={save}
            style={{
              padding: isMobile ? 8 : "6px 10px",
              border: "1px solid var(--color-gray-30)",
              background: "var(--default-bg-color)",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            保存到控制台
          </button>
        )}
        // 也可以用 renderFooter 放在底部：返回一段 JSX 即可
        // renderFooter={() => (<div>你的自定义底部内容</div>)}
      />
    </div>
  );
}
