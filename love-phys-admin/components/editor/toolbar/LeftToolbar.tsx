// components/editor/toolbar/LeftToolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  Type,
  Move3D,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor/editorStore";
import { EditorTool } from "@/lib/editor/types";

const tools: EditorTool[] = [
  {
    id: "select",
    name: "选择工具",
    icon: "MousePointer2",
    description: "选择和移动对象",
  },
  {
    id: "rectangle",
    name: "矩形",
    icon: "Square",
    description: "绘制矩形",
  },
  {
    id: "circle",
    name: "圆形",
    icon: "Circle",
    description: "绘制圆形",
  },
  {
    id: "line",
    name: "直线",
    icon: "Minus",
    description: "绘制直线",
  },
  {
    id: "text",
    name: "文本",
    icon: "Type",
    description: "添加文本标签",
  },
];

const iconMap = {
  MousePointer2,
  Square,
  Circle,
  Minus,
  Type,
  Move3D,
  ZoomIn,
  ZoomOut,
  RotateCcw,
};

export function LeftToolbar() {
  const { currentTool, setCurrentTool, zoom, setZoom, canvas } =
    useEditorStore();

  const handleToolSelect = (toolId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCurrentTool(toolId as any);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom * 0.8, 0.1);
    setZoom(newZoom);
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handlePan = () => {
    if (!canvas) return;
    // 简单的居中逻辑
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.renderAll();
  };

  return (
    <TooltipProvider>
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* 绘制工具 */}
        <div className="p-2 space-y-1">
          <div className="text-xs text-gray-500 font-medium mb-2">工具</div>
          {tools.map((tool) => {
            const IconComponent = iconMap[tool.icon as keyof typeof iconMap];
            const isActive = currentTool === tool.id;

            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleToolSelect(tool.id)}
                    className={`w-12 h-10 p-0 ${
                      isActive
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-center">
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-xs text-gray-500">
                      {tool.description}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* 分隔线 */}
        <div className="mx-2 h-px bg-gray-200"></div>

        {/* 视图控制 */}
        <div className="p-2 space-y-1">
          <div className="text-xs text-gray-500 font-medium mb-2">视图</div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="w-12 h-10 p-0 hover:bg-gray-100"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>放大 ({Math.round(zoom * 100)}%)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="w-12 h-10 p-0 hover:bg-gray-100"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>缩小 ({Math.round(zoom * 100)}%)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="w-12 h-10 p-0 hover:bg-gray-100"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>重置缩放</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePan}
                className="w-12 h-10 p-0 hover:bg-gray-100"
              >
                <Move3D className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>居中视图</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* 底部空间 */}
        <div className="flex-1"></div>

        {/* 当前缩放显示 */}
        <div className="p-2 border-t border-gray-200">
          <div className="text-xs text-center text-gray-500">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
