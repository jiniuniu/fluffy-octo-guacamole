// components/UpdatedSVGModifyDialog.tsx
"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppActions } from "@/lib/store";
import { GenerationRecord } from "@/lib/types";

interface SVGModifyDialogProps {
  record: GenerationRecord;
  onModified?: (newSvgCode: string) => void;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SVGModifyDialog({
  record,
  onModified,
  children,
  open: controlledOpen,
  onOpenChange,
}: SVGModifyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedModel, setSelectedModel] = useState<"claude" | "qwen">(
    "claude"
  );
  const [isModifying, setIsModifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actions = useAppActions();

  // 使用受控的open状态（如果提供）或内部状态
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleModify = async () => {
    if (!feedback.trim() || isModifying) return;

    setIsModifying(true);
    setError(null);

    try {
      const result = await actions.modifySvg(
        record.id,
        feedback.trim(),
        selectedModel
      );

      // 触发回调，更新父组件
      if (onModified) {
        onModified(result.svg_code);
      }

      // 重新加载历史记录以获取最新数据
      await actions.loadHistory(1);

      // 关闭对话框并清空表单
      setOpen(false);
      setFeedback("");
    } catch (err) {
      console.error("SVG修改失败:", err);
      setError(err instanceof Error ? err.message : "修改失败，请重试");
    } finally {
      setIsModifying(false);
    }
  };

  const isFormValid = feedback.trim().length >= 5 && !isModifying;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🔧 修改动画</DialogTitle>
          <DialogDescription>
            告诉我如何改进这个SVG动画，比如调整速度、颜色、大小或效果
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 问题信息 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">原始问题</h4>
            <p className="text-sm text-gray-600">{record.question}</p>
          </div>

          {/* 反馈输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              修改建议 *
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请描述你希望如何改进这个动画...&#10;&#10;例如：&#10;- 让动画速度更慢一些&#10;- 改变颜色为蓝色&#10;- 增加更多的粒子效果&#10;- 让物体运动路径更清晰"
              className="min-h-[100px] resize-none"
              disabled={isModifying}
            />
            <div className="mt-1 text-xs text-gray-500">
              {feedback.length}/500 字符 (最少5个字符)
            </div>
          </div>

          {/* 模型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择AI模型
            </label>
            <div className="grid grid-cols-1 gap-2">
              <div
                onClick={() => !isModifying && setSelectedModel("claude")}
                className={`p-2 border rounded-lg cursor-pointer transition-colors text-sm ${
                  selectedModel === "claude"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${isModifying ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
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
                    <div className="font-medium text-gray-900">Claude</div>
                    <div className="text-xs text-gray-500">
                      推荐使用，修改质量更高
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => !isModifying && setSelectedModel("qwen")}
                className={`p-2 border rounded-lg cursor-pointer transition-colors text-sm ${
                  selectedModel === "qwen"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${isModifying ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
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
                    <div className="font-medium text-gray-900">Qwen</div>
                    <div className="text-xs text-gray-500">
                      响应更快，适合简单修改
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isModifying}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleModify}
              disabled={!isFormValid}
              className="flex-1"
            >
              {isModifying ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  修改中...
                </>
              ) : (
                "🚀 开始修改"
              )}
            </Button>
          </div>

          {!isFormValid && feedback.length > 0 && feedback.length < 5 && (
            <p className="text-xs text-orange-600 text-center">
              修改建议至少需要5个字符
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
