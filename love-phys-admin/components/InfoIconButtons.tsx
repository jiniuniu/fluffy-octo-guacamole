// components/InfoIconButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookOpen, Info } from "lucide-react";

interface InfoIconButtonsProps {
  onShowExplanation: () => void;
  onShowTechInfo: () => void;
}

export function InfoIconButtons({
  onShowExplanation,
  onShowTechInfo,
}: InfoIconButtonsProps) {
  return (
    <TooltipProvider>
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        {/* 物理解释按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowExplanation}
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm border-blue-200 hover:border-blue-300"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>查看物理解释</p>
          </TooltipContent>
        </Tooltip>

        {/* 技术信息按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowTechInfo}
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm border-gray-200 hover:border-gray-300"
            >
              <Info className="w-4 h-4 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>查看技术信息</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
