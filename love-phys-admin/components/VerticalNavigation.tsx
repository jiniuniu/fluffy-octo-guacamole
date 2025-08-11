// components/VerticalNavigation.tsx
"use client";

import { Settings, Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerticalNavigationProps {
  activeTab: "generate" | "history";
  onTabChange: (tab: "generate" | "history") => void;
}

export function VerticalNavigation({
  activeTab,
  onTabChange,
}: VerticalNavigationProps) {
  return (
    <TooltipProvider>
      <div className="w-16 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col items-center py-6 shadow-sm">
        {/* Logo区域 */}
        <div className="mb-12">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={30}
              height={30}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* 导航按钮组 */}
        <div className="space-y-3 mb-auto">
          {/* 生成按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange("generate")}
                className={`w-12 h-12 p-0 rounded-full transition-all duration-200 flex items-center justify-center ${
                  activeTab === "generate"
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>生成新内容</p>
            </TooltipContent>
          </Tooltip>

          {/* 历史记录按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange("history")}
                className={`w-12 h-12 p-0 rounded-full transition-all duration-200 flex items-center justify-center ${
                  activeTab === "history"
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <History className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>历史记录</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* 底部设置按钮 */}
        <div className="mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>设置</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
