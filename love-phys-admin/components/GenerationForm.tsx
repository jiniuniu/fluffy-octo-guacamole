// components/GenerationForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore, useAppActions } from "@/lib/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModelSelector } from "./ModelSelector";

export function GenerationForm() {
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState<"claude" | "qwen">(
    "claude"
  );

  const store = useAppStore();
  const actions = useAppActions();

  const isGenerating =
    store.asyncOperation.isLoading &&
    store.asyncOperation.type === "generating";

  const handleGenerate = async () => {
    if (!question.trim() || isGenerating) return;

    actions.clearError();
    await actions.generateFull(question.trim(), selectedModel);

    // 只有成功时才清空输入框
    if (!useAppStore.getState().error) {
      setQuestion("");
    }
  };

  const isFormValid = question.trim().length >= 5 && !isGenerating;

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
          disabled={isGenerating}
        />
        <div className="mt-1 text-xs text-gray-500">
          {question.length}/500 字符 (最少5个字符)
        </div>
      </div>

      {/* 模型选择 */}
      <ModelSelector
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        disabled={isGenerating}
      />

      {/* 生成按钮 */}
      <Button
        onClick={handleGenerate}
        disabled={!isFormValid}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
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
