// 更简单的测试页面 - app/simple-test/page.tsx
"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

// 动态导入 Excalidraw 及其工具函数
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        加载 Excalidraw...
      </div>
    ),
  }
);

export default function SimpleTest() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  const setExcalidrawAPI = (api: ExcalidrawImperativeAPI | null) => {
    console.log("📌 Excalidraw API 设置:", api ? "成功" : "失败");
    apiRef.current = api;
    setIsApiReady(!!api);

    if (api) {
      setTimeout(() => {
        api.setToast({ message: "✅ Excalidraw 加载成功!", duration: 2000 });
        console.log("✅ Excalidraw 初始化完成");
      }, 500);
    }
  };

  // 使用 convertToExcalidrawElements 添加元素
  const addSimpleElements = async () => {
    if (!apiRef.current) {
      console.error("API未准备就绪");
      return;
    }

    console.log("🎨 添加简单元素...");

    try {
      // 导入 Excalidraw 的 convertToExcalidrawElements 函数
      const { convertToExcalidrawElements } = await import(
        "@excalidraw/excalidraw"
      );

      console.log(
        "📦 convertToExcalidrawElements 函数:",
        convertToExcalidrawElements
      );

      // 创建骨架元素（ExcalidrawElementSkeleton）
      const skeletonElements = [
        {
          type: "rectangle" as const,
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          backgroundColor: "#e3f2fd",
          strokeColor: "#1976d2",
          label: {
            text: "用户服务",
          },
        },
        {
          type: "rectangle" as const,
          x: 400,
          y: 100,
          width: 200,
          height: 100,
          backgroundColor: "#e8f5e8",
          strokeColor: "#388e3c",
          label: {
            text: "订单服务",
          },
        },
        {
          type: "arrow" as const,
          x: 300,
          y: 150,
          label: {
            text: "调用",
          },
          start: {
            type: "rectangle" as const,
          },
          end: {
            type: "rectangle" as const,
          },
        },
      ];

      console.log("🎯 骨架元素:", skeletonElements);

      // 转换为完整的 Excalidraw 元素
      const elements = convertToExcalidrawElements(skeletonElements);

      console.log("✅ 转换后的元素:", elements);
      console.log("📊 元素数量:", elements.length);

      apiRef.current.updateScene({
        elements,
        appState: {
          viewBackgroundColor: "#ffffff",
        },
      });

      // 自动缩放
      setTimeout(() => {
        apiRef.current?.scrollToContent();
      }, 300);

      apiRef.current.setToast({ message: "✅ 元素添加成功!", duration: 2000 });
      console.log("✅ 元素添加成功");
    } catch (error) {
      console.error("❌ 添加元素失败:", error);
      apiRef.current.setToast({
        message: `添加失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
        duration: 3000,
      });
    }
  };

  // 测试我们的转换函数
  const testConversion = async () => {
    if (!apiRef.current) {
      console.error("API未准备就绪");
      return;
    }

    console.log("🧪 测试数据转换...");

    try {
      // 直接导入转换函数
      const { convertGraphToExcalidraw } = await import(
        "@/lib/diagram/convert"
      );

      // 简单的测试数据
      const testData = {
        rankdir: "LR" as const,
        nodes: [
          { id: "node1", label: "用户", kind: "actor" as const },
          { id: "node2", label: "服务", kind: "microservice" as const },
          { id: "node3", label: "数据库", kind: "db" as const },
        ],
        edges: [
          { from: "node1", to: "node2", label: "请求" },
          { from: "node2", to: "node3", label: "查询" },
        ],
      };

      console.log("📊 测试数据:", testData);
      apiRef.current.setToast({
        message: "🔄 正在转换数据...",
        duration: 2000,
      });

      const excalidrawScene = await convertGraphToExcalidraw(testData);

      console.log("✅ 转换结果:", excalidrawScene);
      console.log("📈 生成的元素数量:", excalidrawScene.elements.length);

      if (excalidrawScene.elements.length === 0) {
        throw new Error("转换后没有生成任何元素");
      }

      apiRef.current.updateScene({
        elements: excalidrawScene.elements,
        appState: {
          viewBackgroundColor: "#ffffff",
          theme: "light" as const,
        },
      });

      setTimeout(() => {
        apiRef.current?.scrollToContent();
      }, 300);

      apiRef.current.setToast({
        message: `✅ 转换成功! 生成了 ${excalidrawScene.elements.length} 个元素`,
        duration: 3000,
      });
    } catch (error) {
      console.error("❌ 转换失败:", error);
      apiRef.current.setToast({
        message: `转换失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
        duration: 4000,
      });
    }
  };

  // 清空画布
  const clearCanvas = () => {
    if (!apiRef.current) return;

    apiRef.current.updateScene({
      elements: [],
      appState: { viewBackgroundColor: "#ffffff" },
    });

    apiRef.current.setToast({ message: "🗑️ 画布已清空", duration: 1000 });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 控制栏 */}
      <div className="bg-gray-100 border-b p-4 flex items-center gap-4 flex-wrap">
        <h1 className="text-xl font-bold">🧪 Excalidraw 简单测试</h1>

        <div className="flex items-center gap-2">
          <span className="text-sm">状态:</span>
          <div
            className={`w-3 h-3 rounded-full ${
              isApiReady ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm">{isApiReady ? "已连接" : "未连接"}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={addSimpleElements}
            disabled={!isApiReady}
            className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            添加简单元素
          </button>

          <button
            onClick={testConversion}
            disabled={!isApiReady}
            className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            测试数据转换
          </button>

          <button
            onClick={clearCanvas}
            disabled={!isApiReady}
            className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-300"
          >
            清空
          </button>
        </div>
      </div>

      {/* Excalidraw 画布 */}
      <div className="flex-1">
        <Excalidraw
          excalidrawAPI={setExcalidrawAPI}
          initialData={{
            elements: [],
            appState: {
              viewBackgroundColor: "#ffffff",
              theme: "light" as const,
            },
            files: {},
          }}
        />
      </div>
    </div>
  );
}
