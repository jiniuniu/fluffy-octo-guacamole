"use client";

import { ExcalidrawClient } from "@/components/ExcalidrawClient";
import { Sidebar } from "@/components/Sidebar";
import { emptyScene } from "@/lib/types";
import { architectureTemplates } from "@/lib/diagram/utils";
import { useState, useEffect, useRef } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export default function SlidesPage() {
  // 初始数据：一个空画布
  const initialData = emptyScene();
  const [prompt, setPrompt] = useState("");
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  // 设置 Excalidraw API 引用
  const setExcalidrawAPI = (api: ExcalidrawImperativeAPI | null) => {
    apiRef.current = api;
  };

  // 处理模板选择
  const handleTemplateSelect = (templateKey: keyof typeof architectureTemplates) => {
    const template = architectureTemplates[templateKey];
    console.log("选择了模板:", template.name);
    // 这里可以添加更多模板相关的逻辑
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        onPromptChange={setPrompt} 
        onTemplateSelect={handleTemplateSelect}
        initialPrompt={prompt}
      />
      <div className="flex-1">
        <ExcalidrawClient 
          initialData={initialData} 
          excalidrawAPI={setExcalidrawAPI}
        />
      </div>
    </div>
  );
}
