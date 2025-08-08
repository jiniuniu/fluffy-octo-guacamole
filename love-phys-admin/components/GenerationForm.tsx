// components/GenerationForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore, useAppActions } from "@/lib/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModelSelector } from "./ModelSelector";

export function GenerationForm() {
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState<"claude" | "qwen">(
    "claude"
  );
  const [enableTts, setEnableTts] = useState(true);
  const [voiceType, setVoiceType] = useState("Cherry");

  const store = useAppStore();
  const actions = useAppActions();

  const isGenerating =
    store.asyncOperation.isLoading &&
    store.asyncOperation.type === "generating";

  const handleGenerate = async () => {
    if (!question.trim() || isGenerating) return;

    actions.clearError();
    await actions.generateFull(
      question.trim(),
      selectedModel,
      enableTts,
      voiceType
    );

    // 只有成功时才清空输入框
    if (!useAppStore.getState().error) {
      setQuestion("");
    }
  };

  const isFormValid = question.trim().length >= 5 && !isGenerating;

  const voiceOptions = [
    { value: "Cherry", label: "Cherry - 甜美女声" },
    { value: "Chelsie", label: "Chelsie - 标准女声" },
    { value: "Serena", label: "Serena - 优雅女声" },
    { value: "Ethan", label: "Ethan - 标准男声" },
    { value: "Dylan", label: "Dylan - 京腔男声" },
    { value: "Jada", label: "Jada - 吴语女声" },
    { value: "Sunny", label: "Sunny - 川音女声" },
  ];

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

      {/* 音频选项 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-tts"
            checked={enableTts}
            onCheckedChange={(checked) => setEnableTts(checked as boolean)}
            disabled={isGenerating}
          />
          <label
            htmlFor="enable-tts"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            🎤 生成语音解释
          </label>
        </div>

        {enableTts && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择声音类型
            </label>
            <Select
              value={voiceType}
              onValueChange={setVoiceType}
              disabled={isGenerating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择声音" />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

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
          `🎯 生成内容${enableTts ? "和音频" : ""}动画`
        )}
      </Button>

      {!isFormValid && question.length > 0 && question.length < 5 && (
        <p className="text-xs text-orange-600 text-center">
          问题描述至少需要5个字符
        </p>
      )}

      {enableTts && (
        <p className="text-xs text-gray-500 text-center">
          💡 启用语音功能将为物理解释生成专业的语音朗读
        </p>
      )}
    </div>
  );
}
