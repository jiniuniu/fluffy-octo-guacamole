/* eslint-disable @typescript-eslint/no-unused-vars */
// components/LoadingState.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Palette,
  Mic,
  CheckCircle,
  Clock,
  X,
  Sparkles,
  Zap,
} from "lucide-react";

interface LoadingStateProps {
  currentStep: string;
  progress: number;
  type: "generating" | "modifying" | "loading" | null;
  enableTts?: boolean;
  model?: "claude" | "qwen";
  onCancel?: () => void;
}

interface WorkflowStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  duration: number;
  startTime: number;
  endTime: number;
}

export function LoadingState({
  currentStep,
  progress,
  type,
  enableTts = true,
  model = "claude",
  onCancel,
}: LoadingStateProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // 定义工作流步骤
  const workflowSteps: WorkflowStep[] = useMemo(
    () => [
      {
        id: "explanation",
        name: "生成物理解释",
        icon: <BookOpen className="w-5 h-5" />,
        duration: 10,
        startTime: 0,
        endTime: 10,
      },
      {
        id: "svg",
        name: "生成SVG动画",
        icon: <Palette className="w-5 h-5" />,
        duration: 30,
        startTime: 10,
        endTime: 40,
      },
      ...(enableTts
        ? [
            {
              id: "audio",
              name: "生成语音解释",
              icon: <Mic className="w-5 h-5" />,
              duration: 20,
              startTime: 40,
              endTime: 60,
            },
          ]
        : []),
    ],
    [enableTts]
  );

  const totalDuration = useMemo(() => (enableTts ? 60 : 40), [enableTts]);

  // 计时器
  useEffect(() => {
    if (type === "generating" || type === "modifying") {
      setElapsedTime(0);
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [type]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStepStatus = (step: WorkflowStep) => {
    if (elapsedTime >= step.endTime) return "completed";
    if (elapsedTime >= step.startTime) return "active";
    return "pending";
  };

  const getLoadingConfig = () => {
    switch (type) {
      case "generating":
        return {
          icon:
            model === "claude" ? (
              <Sparkles className="w-6 h-6 text-purple-600" />
            ) : (
              <Zap className="w-6 h-6 text-blue-600" />
            ),
          title: "正在生成物理动画",
          subtitle: `使用 ${model === "claude" ? "Claude Sonnet 4" : "Qwen Coder Plus"}`,
          showWorkflow: true,
        };
      case "modifying":
        return {
          icon: <Palette className="w-6 h-6 text-orange-600" />,
          title: "正在修改动画",
          subtitle: "根据您的反馈优化动画效果",
          showWorkflow: false,
        };
      case "loading":
        return {
          icon: <Clock className="w-6 h-6 text-gray-600" />,
          title: "加载中",
          subtitle: "请稍候",
          showWorkflow: false,
        };
      default:
        return {
          icon: <Clock className="w-6 h-6 text-gray-600" />,
          title: "处理中",
          subtitle: "请稍候",
          showWorkflow: false,
        };
    }
  };

  const config = getLoadingConfig();

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        {/* 主卡片 */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-xl">
          {/* 头部 */}
          <div className="text-center mb-8">
            {/* 主图标 */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-md">
              {config.icon}
            </div>

            {/* 标题 */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {config.title}
            </h3>
            <p className="text-gray-600 text-sm mb-6">{config.subtitle}</p>

            {/* 时间估计 */}
            <div className="bg-blue-50 rounded-xl p-3 mb-6">
              <p className="text-sm text-blue-700">
                {type === "generating"
                  ? enableTts
                    ? "预计需要 1-2 分钟"
                    : "预计需要约 40 秒"
                  : type === "modifying"
                    ? "预计需要约 30 秒"
                    : "请稍候"}
              </p>
            </div>
          </div>

          {/* 工作流步骤 - 仅在生成时显示 */}
          {config.showWorkflow && (
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {/* 连接线 */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>

                {workflowSteps.map((step, index) => {
                  const status = getStepStatus(step);

                  return (
                    <div
                      key={step.id}
                      className="flex flex-col items-center relative z-10"
                    >
                      {/* 步骤图标 */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                          status === "completed"
                            ? "bg-green-500 text-white shadow-lg scale-110"
                            : status === "active"
                              ? "bg-blue-500 text-white shadow-lg scale-110 animate-pulse"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {status === "completed" ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <div
                            className={
                              status === "active" ? "animate-bounce" : ""
                            }
                          >
                            {step.icon}
                          </div>
                        )}
                      </div>

                      {/* 步骤名称 */}
                      <div
                        className={`text-xs text-center max-w-20 ${
                          status === "completed"
                            ? "text-green-600 font-medium"
                            : status === "active"
                              ? "text-blue-600 font-medium"
                              : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 当前状态 */}
          <div className="text-center mb-6">
            <p className="text-gray-700 font-medium mb-4">{currentStep}</p>

            {/* 时间显示 */}
            <div className="inline-flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-mono text-gray-700">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2 rounded-xl px-6"
            >
              <X className="w-4 h-4" />
              取消{type === "generating" ? "生成" : "操作"}
            </Button>
          </div>
        </div>

        {/* 背景装饰 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse" />
          <div
            className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
    </div>
  );
}
