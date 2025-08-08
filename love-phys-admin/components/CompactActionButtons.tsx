// components/CompactActionButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookOpen, Info, Wrench } from "lucide-react";
import { SVGModifyDialog } from "./SVGModifyDialog";
import { GenerationRecord } from "@/lib/types";

interface CompactActionButtonsProps {
  record: GenerationRecord;
  onShowExplanation: () => void;
  onShowTechInfo: () => void;
  onSvgModified?: (newSvgCode: string) => void;
}

export function CompactActionButtons({
  record,
  onShowExplanation,
  onShowTechInfo,
  onSvgModified,
}: CompactActionButtonsProps) {
  return (
    <TooltipProvider>
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {/* 物理解释按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowExplanation}
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm border-blue-200 hover:border-blue-300"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>物理解释</p>
          </TooltipContent>
        </Tooltip>

        {/* 技术信息按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowTechInfo}
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm border-gray-200 hover:border-gray-300"
            >
              <Info className="w-3.5 h-3.5 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>技术信息</p>
          </TooltipContent>
        </Tooltip>

        {/* Fix Me 按钮 - 修复结构 */}
        <SVGModifyDialog record={record} onModified={onSvgModified}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm border-orange-200 hover:border-orange-300"
            title="修改动画"
          >
            <Wrench className="w-3.5 h-3.5 text-orange-600" />
          </Button>
        </SVGModifyDialog>
      </div>
    </TooltipProvider>
  );
}
