"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { InitialData } from "@/lib/types";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export function ExcalidrawClient({
  initialData,
  excalidrawAPI,
}: {
  initialData?: InitialData;
  excalidrawAPI?: (api: ExcalidrawImperativeAPI | null) => void;
}) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const setApiRef = (api: ExcalidrawImperativeAPI | null) => {
    apiRef.current = api;
    if (excalidrawAPI) {
      excalidrawAPI(api);
    }
  };

  const save = () => {
    if (!apiRef.current) return;
    const elements = apiRef.current.getSceneElements();
    const appState = apiRef.current.getAppState();
    const files = apiRef.current.getFiles();
    console.log("保存场景", { elements, appState, files });
    apiRef.current.setToast({ message: "已保存到控制台", duration: 2000 });
  };

  // 确保 initialData 始终有默认值，避免 undefined
  const safeInitialData: InitialData = initialData || {
    elements: [],
    appState: { viewBackgroundColor: "#ffffff" },
    files: {},
  };

  return (
    <div style={{ height: "100vh" }}>
      <Excalidraw
        excalidrawAPI={setApiRef}
        initialData={safeInitialData}
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
      />
    </div>
  );
}
