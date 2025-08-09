// components/GenerationForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppStore, useAppActions } from "@/lib/store";
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
    "claude"
  );
  const [enableTts, setEnableTts] = useState(true);
  const [voiceType, setVoiceType] = useState("Cherry");

  const store = useAppStore();
  const actions = useAppActions();

  const isGenerating =
    store.asyncOperation.isLoading &&
    store.asyncOperation.type === "generating";

  const voiceOptions = [
    { id: "Cherry", name: "Cherry", description: "甜美女声" },
    { id: "Chelsie", name: "Chelsie", description: "标准女声" },
    { id: "Serena", name: "Serena", description: "优雅女声" },
    { id: "Ethan", name: "Ethan", description: "标准男声" },
    { id: "Dylan", name: "Dylan", description: "京腔男声" },
    { id: "Jada", name: "Jada", description: "吴语女声" },
    { id: "Sunny", name: "Sunny", description: "川音女声" },
  ];

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const isFormValid = question.trim().length >= 5 && !isGenerating;

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
              {question.length}/500
              {question.length > 0 && question.length < 5 && (
                <span className="text-orange-600 ml-1">(最少5个字符)</span>
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
                    {selectedModel === "claude" ? (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Claude Sonnet 4</span>
                        <span className="text-xs text-gray-500">
                          • 推荐使用
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span>Qwen Coder Plus</span>
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
                  onClick={() => setSelectedModel("claude")}
                  className={`flex items-center gap-3 p-3 ${
                    selectedModel === "claude" ? "bg-purple-50" : ""
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Claude Sonnet 4</div>
                    <div className="text-xs text-gray-500">
                      推荐使用，质量更高，响应详细
                    </div>
                  </div>
                  {selectedModel === "claude" && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSelectedModel("qwen")}
                  className={`flex items-center gap-3 p-3 ${
                    selectedModel === "qwen" ? "bg-blue-50" : ""
                  }`}
                >
                  <Zap className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Qwen Coder Plus</div>
                    <div className="text-xs text-gray-500">
                      响应更快，成本较低，适合简单问题
                    </div>
                  </div>
                  {selectedModel === "qwen" && (
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
                    {voiceOptions.map((voice) => (
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
