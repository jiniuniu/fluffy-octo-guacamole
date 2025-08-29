"use client";

import { ExcalidrawClient } from "@/components/ExcalidrawClient";
import { emptyScene } from "@/lib/types";
import { convertGraphToExcalidraw } from "@/lib/diagram/utils";
import { useState, useRef } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
  recommendationSystemTestData,
  simpleTestData,
  verticalTestData,
  securityTestData,
  bigDataTestData,
  cloudNativeTestData,
} from "@/lib/test-data";

export default function TestPage() {
  const initialData = emptyScene();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>("");
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const setExcalidrawAPI = (api: ExcalidrawImperativeAPI | null) => {
    apiRef.current = api;
  };

  // 测试数据映射
  const testDataMap = {
    simple: {
      data: simpleTestData,
      name: "简单微服务",
      description: "基础的微服务架构，包含用户、订单、支付服务",
    },
    recommendation: {
      data: recommendationSystemTestData,
      name: "推荐系统",
      description: "完整的推荐系统架构，包含AI/ML组件",
    },
    vertical: {
      data: verticalTestData,
      name: "垂直布局",
      description: "测试TB(上到下)布局的简单架构",
    },
    security: {
      data: securityTestData,
      name: "安全架构",
      description: "安全相关组件的架构设计",
    },
    bigdata: {
      data: bigDataTestData,
      name: "大数据平台",
      description: "大数据处理平台架构",
    },
    cloudnative: {
      data: cloudNativeTestData,
      name: "云原生架构",
      description: "Kubernetes云原生应用架构",
    },
  };

  const handleTestGenerate = async (testKey: keyof typeof testDataMap) => {
    if (!apiRef.current) {
      console.error("Excalidraw API 未初始化");
      return;
    }

    setIsGenerating(true);
    setCurrentTest(testKey);

    try {
      const testInfo = testDataMap[testKey];

      console.log(`开始测试: ${testInfo.name}`, testInfo.data);

      apiRef.current.setToast({
        message: `正在生成 ${testInfo.name}...`,
        duration: 3000,
      });

      // 转换为 Excalidraw 格式
      const excalidrawScene = await convertGraphToExcalidraw(testInfo.data);

      console.log("转换后的Excalidraw场景:", excalidrawScene);

      // 清空当前场景
      apiRef.current.updateScene({
        elements: [],
        appState: { viewBackgroundColor: "#ffffff" },
      });

      // 稍微延迟后更新场景，确保清空完成
      setTimeout(() => {
        if (apiRef.current) {
          apiRef.current.updateScene({
            elements: excalidrawScene.elements,
            appState: {
              ...excalidrawScene.appState,
              viewBackgroundColor: "#ffffff",
            },
          });

          // 自动缩放到合适大小
          setTimeout(() => {
            if (apiRef.current) {
              apiRef.current.scrollToContent();
            }
          }, 200);
        }
      }, 100);

      apiRef.current.setToast({
        message: `${testInfo.name} 生成成功！`,
        duration: 2000,
      });
    } catch (error) {
      console.error("生成架构图失败:", error);

      if (apiRef.current) {
        apiRef.current.setToast({
          message: `生成失败: ${
            error instanceof Error ? error.message : "未知错误"
          }`,
          duration: 4000,
        });
      }
    } finally {
      setIsGenerating(false);
      setCurrentTest("");
    }
  };

  return (
    <div className="flex h-screen">
      {/* 测试控制面板 */}
      <div className="w-96 border-r bg-background p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">🧪 架构图转换测试</h1>
          <p className="text-sm text-muted-foreground">
            测试不同类型的架构数据转换为Excalidraw图表的效果
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(testDataMap).map(([key, info]) => (
            <div
              key={key}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                currentTest === key
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() =>
                handleTestGenerate(key as keyof typeof testDataMap)
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">{info.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {info.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>节点: {info.data.nodes.length}</span>
                    <span>•</span>
                    <span>连接: {info.data.edges.length}</span>
                    <span>•</span>
                    <span>布局: {info.data.rankdir}</span>
                    {info.data.groups && (
                      <>
                        <span>•</span>
                        <span>分组: {info.data.groups.length}</span>
                      </>
                    )}
                  </div>
                </div>
                {currentTest === key && isGenerating && (
                  <div className="ml-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">📝 测试说明</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 点击任意测试用例生成对应的架构图</li>
            <li>• 检查节点样式、连接关系是否正确</li>
            <li>• 验证布局算法是否按预期工作</li>
            <li>• 测试分组功能和主题应用效果</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">🔧 调试信息</h4>
          <p className="text-xs text-gray-600">
            打开浏览器开发者工具查看详细的转换过程日志
          </p>
        </div>
      </div>

      {/* Excalidraw 画布 */}
      <div className="flex-1">
        <ExcalidrawClient
          initialData={initialData}
          excalidrawAPI={setExcalidrawAPI}
        />
      </div>
    </div>
  );
}
