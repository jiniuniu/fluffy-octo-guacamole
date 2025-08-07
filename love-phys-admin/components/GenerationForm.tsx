"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";

export function GenerationForm() {
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState<"claude" | "qwen">(
    "claude"
  );
  const { setGenerating, setProgress, setCurrentStep } = useAppStore();

  const handleGenerate = async () => {
    if (!question.trim()) return;

    // 模拟生成过程
    setGenerating(true);
    setProgress(0);
    setCurrentStep("📝 正在生成物理解释...");

    // 这里后续会替换为真实的API调用
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);

      if (i === 50) {
        setCurrentStep("🎨 正在生成SVG动画...");
      }
    }

    setTimeout(() => {
      setGenerating(false);
      setProgress(0);
      setCurrentStep("");

      // 模拟添加新记录
      const newRecord = {
        id: Date.now().toString(),
        question,
        explanation: "这是一个模拟的物理解释...",
        svg_code: "<svg>模拟SVG内容</svg>",
        model: selectedModel,
        status: "success" as const,
        created_at: new Date().toISOString(),
      };

      useAppStore.getState().addRecord(newRecord);
      useAppStore.getState().setSelectedRecord(newRecord);
      setQuestion("");
    }, 500);
  };

  return (
    <div className="p-4 space-y-6">
      {/* 问题输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          物理问题
        </label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="请输入物理问题或现象...&#10;&#10;例如: 为什么会有彩虹? 自由落体的加速度是多少? 电磁感应的原理?"
          className="min-h-[120px] resize-none"
        />
      </div>

      {/* 模型选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          选择AI模型
        </label>
        <div className="grid grid-cols-1 gap-3">
          <div
            onClick={() => setSelectedModel("claude")}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedModel === "claude"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedModel === "claude"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {selectedModel === "claude" && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Claude Sonnet</div>
                <div className="text-xs text-gray-500">推荐使用，质量更高</div>
              </div>
            </div>
          </div>

          <div
            onClick={() => setSelectedModel("qwen")}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedModel === "qwen"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedModel === "qwen"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {selectedModel === "qwen" && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Qwen Coder</div>
                <div className="text-xs text-gray-500">响应更快，成本较低</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      <Button
        onClick={handleGenerate}
        disabled={!question.trim()}
        className="w-full"
        size="lg"
      >
        🎯 生成内容和动画
      </Button>
    </div>
  );
}
