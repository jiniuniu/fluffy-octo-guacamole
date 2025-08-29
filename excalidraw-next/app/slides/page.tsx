"use client";

import { ExcalidrawClient } from "@/components/ExcalidrawClient";
import { Sidebar } from "@/components/Sidebar";
import { emptyScene } from "@/lib/types";
import { architectureTemplates } from "@/lib/diagram/utils";
import { convertGraphToExcalidraw } from "@/lib/diagram/utils";
import { useState, useEffect, useRef } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export default function SlidesPage() {
  // 初始数据：一个空画布
  const initialData = emptyScene();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  // 设置 Excalidraw API 引用
  const setExcalidrawAPI = (api: ExcalidrawImperativeAPI | null) => {
    apiRef.current = api;
  };

  // 处理模板选择
  const handleTemplateSelect = (
    templateKey: keyof typeof architectureTemplates
  ) => {
    const template = architectureTemplates[templateKey];
    console.log("选择了模板:", template.name);
    setPrompt(template.prompt);
  };

  // 处理生成架构图
  const handleGenerate = async (promptText: string) => {
    if (!apiRef.current || !promptText.trim()) {
      return;
    }

    setIsGenerating(true);

    try {
      // 显示加载提示
      apiRef.current.setToast({
        message: "正在生成架构图...",
        duration: 3000,
      });

      // 调用后端API生成图表
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptText,
          rankdir: "LR", // 可以根据需要调整
        }),
      });

      if (!response.ok) {
        throw new Error(`生成失败: ${response.statusText}`);
      }

      const graphData = await response.json();

      // 转换为 Excalidraw 格式
      const excalidrawScene = await convertGraphToExcalidraw(graphData);

      // 更新场景
      apiRef.current.updateScene({
        elements: excalidrawScene.elements,
        appState: {
          viewBackgroundColor: "#ffffff",
          theme: "light" as const,
        },
      });

      // 自动缩放到合适大小
      setTimeout(() => {
        if (apiRef.current) {
          apiRef.current.scrollToContent();
        }
      }, 100);

      apiRef.current.setToast({
        message: "架构图生成成功！",
        duration: 2000,
      });
    } catch (error) {
      console.error("生成架构图失败:", error);

      // 显示错误提示
      apiRef.current.setToast({
        message: `生成失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
        duration: 4000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        onPromptChange={setPrompt}
        onTemplateSelect={handleTemplateSelect}
        onGenerate={handleGenerate}
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
