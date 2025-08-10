// components/GenerationForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppStore, useAppActions } from "@/lib/store";
import {
  MODELS,
  MODEL_CONFIG,
  VOICE_OPTIONS,
  VALIDATION,
  ASYNC_OPERATION_TYPES,
} from "@/lib/constants";
import {
  ChevronDown,
  Mic,
  MicOff,
  Send,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function GenerationForm() {
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState<"claude" | "qwen">(
    MODELS.CLAUDE
  );
  const [enableTts, setEnableTts] = useState(true);
  const [voiceType, setVoiceType] = useState("Cherry");

  const store = useAppStore();
  const actions = useAppActions();

  const isGenerating =
    store.asyncOperation.isLoading &&
    store.asyncOperation.type === ASYNC_OPERATION_TYPES.GENERATING;

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
    const currentState = useAppStore.getState();
    if (!currentState.error) {
      setQuestion("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const isFormValid =
    question.trim().length >= VALIDATION.MIN_QUESTION_LENGTH && !isGenerating;

  return (
    <div className="p-4 space-y-4">
      {/* 错误提示 */}
      {store.error && (
        <Alert variant="destructive">
          <AlertDescription>{store.error}</AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          生成新内容
        </h2>

        {/* 主要输入区域 - 内嵌提交按钮 */}
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:shadow-md focus-within:border-blue-300 relative">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入物理问题或现象...&#10;&#10;例如: 为什么会有彩虹? 自由落体的加速度是多少?"
              className="min-h-[160px] resize-y border-0 bg-transparent focus:ring-0 focus:outline-none p-4 pr-14 text-sm leading-relaxed"
              disabled={isGenerating}
            />

            {/* 内嵌的发送按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={!isFormValid}
              size="sm"
              className={`absolute bottom-3 right-3 h-8 w-8 p-0 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isGenerating ? (
                <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>

            {/* 字符计数 - 移到左下角 */}
            <div className="absolute bottom-3 left-4 text-xs text-gray-500">
              {question.length}/{VALIDATION.MAX_QUESTION_LENGTH}
              {question.length > 0 &&
                question.length < VALIDATION.MIN_QUESTION_LENGTH && (
                  <span className="text-orange-600 ml-1">
                    (最少{VALIDATION.MIN_QUESTION_LENGTH}个字符)
                  </span>
                )}
            </div>
          </div>

          {/* 模型选择 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">AI模型</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isGenerating}
                  className="w-full justify-between h-10 rounded-xl border-gray-200 text-sm hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {selectedModel === MODELS.CLAUDE ? (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>{MODEL_CONFIG[MODELS.CLAUDE].displayName}</span>
                        <span className="text-xs text-gray-500">
                          • 推荐使用
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span>{MODEL_CONFIG[MODELS.QWEN].displayName}</span>
                        <span className="text-xs text-gray-500">
                          • 响应更快
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                <DropdownMenuItem
                  onClick={() => setSelectedModel(MODELS.CLAUDE)}
                  className={`flex items-center gap-3 p-3 ${
                    selectedModel === MODELS.CLAUDE ? "bg-purple-50" : ""
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {MODEL_CONFIG[MODELS.CLAUDE].displayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {MODEL_CONFIG[MODELS.CLAUDE].description}
                    </div>
                  </div>
                  {selectedModel === MODELS.CLAUDE && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSelectedModel(MODELS.QWEN)}
                  className={`flex items-center gap-3 p-3 ${
                    selectedModel === MODELS.QWEN ? "bg-blue-50" : ""
                  }`}
                >
                  <Zap className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {MODEL_CONFIG[MODELS.QWEN].displayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {MODEL_CONFIG[MODELS.QWEN].description}
                    </div>
                  </div>
                  {selectedModel === MODELS.QWEN && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 音频选择 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              语音设置
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isGenerating}
                  className="w-full justify-between h-10 rounded-xl border-gray-200 text-sm hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {enableTts ? (
                      <>
                        <Mic className="w-4 h-4 text-orange-600" />
                        <span>语音解释</span>
                        <span className="text-xs text-gray-500">
                          • {voiceType}
                        </span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-4 h-4 text-gray-500" />
                        <span>关闭语音</span>
                        <span className="text-xs text-gray-500">• 仅文本</span>
                      </>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                <DropdownMenuItem
                  onClick={() => setEnableTts(false)}
                  className={`flex items-center gap-3 p-3 ${
                    !enableTts ? "bg-gray-50" : ""
                  }`}
                >
                  <MicOff className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">关闭语音</div>
                    <div className="text-xs text-gray-500">
                      仅生成文字解释，更快完成
                    </div>
                  </div>
                  {!enableTts && (
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setEnableTts(true)}
                  className={`flex items-center gap-3 p-3 ${
                    enableTts ? "bg-orange-50" : ""
                  }`}
                >
                  <Mic className="w-4 h-4 text-orange-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">生成语音解释</div>
                    <div className="text-xs text-gray-500">
                      为物理解释添加专业语音朗读
                    </div>
                  </div>
                  {enableTts && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </DropdownMenuItem>

                {enableTts && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-2 text-xs font-medium text-gray-500">
                      选择声音类型
                    </div>
                    {VOICE_OPTIONS.map((voice) => (
                      <DropdownMenuItem
                        key={voice.id}
                        onClick={() => setVoiceType(voice.id)}
                        className={`flex items-center justify-between px-3 py-2 ${
                          voiceType === voice.id ? "bg-orange-50" : ""
                        }`}
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {voice.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {voice.description}
                          </div>
                        </div>
                        {voiceType === voice.id && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
