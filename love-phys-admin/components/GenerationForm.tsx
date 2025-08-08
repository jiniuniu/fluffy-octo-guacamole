// components/GenerationForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore, useAppActions } from "@/lib/store";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function GenerationForm() {
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState<"claude" | "qwen">(
    "claude"
  );

  const store = useAppStore();
  const actions = useAppActions();

  const handleGenerate = async () => {
    if (!question.trim() || store.isGenerating) return;

    actions.clearError();
    await actions.generateFull(question.trim(), selectedModel);

    // 只有成功时才清空输入框
    if (!useAppStore.getState().error) {
      setQuestion("");
    }
  };

  const isFormValid = question.trim().length >= 5 && !store.isGenerating;

  return (
    <div className="p-4 space-y-6">
      {/* 错误提示 */}
      {store.error && (
        <Alert variant="destructive">
          <AlertDescription>{store.error}</AlertDescription>
        </Alert>
      )}

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
          disabled={store.isGenerating}
        />
        <div className="mt-1 text-xs text-gray-500">
          {question.length}/500 字符 (最少5个字符)
        </div>
      </div>

      {/* 模型选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          选择AI模型
        </label>
        <div className="grid grid-cols-1 gap-3">
          <div
            onClick={() => !store.isGenerating && setSelectedModel("claude")}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedModel === "claude"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } ${store.isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
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
                <div className="font-medium text-gray-900">Claude Sonnet 4</div>
                <div className="text-xs text-gray-500">
                  推荐使用，质量更高，响应详细
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => !store.isGenerating && setSelectedModel("qwen")}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedModel === "qwen"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } ${store.isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
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
                <div className="font-medium text-gray-900">Qwen Coder Plus</div>
                <div className="text-xs text-gray-500">
                  响应更快，成本较低，适合简单问题
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      <Button
        onClick={handleGenerate}
        disabled={!isFormValid}
        className="w-full"
        size="lg"
      >
        {store.isGenerating ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            生成中...
          </>
        ) : (
          "🎯 生成内容和动画"
        )}
      </Button>

      {!isFormValid && question.length > 0 && question.length < 5 && (
        <p className="text-xs text-orange-600 text-center">
          问题描述至少需要5个字符
        </p>
      )}
    </div>
  );
}
