"use client";

import {
  Square,
  Circle,
  Triangle,
  Type,
  Image as ImageIcon,
  Brush,
  MousePointer,
  Undo,
  Redo,
  Eye,
  Download,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useCanvasStore } from "@/store/canvas-store";
import { createShape, createText } from "@/lib/fabric-utils";
import { ToolType } from "@/types/canvas";
import FileUpload from "../common/FileUpload";

export default function MainToolbar() {
  const { canvas, currentTool, setCurrentTool, undo, redo, canUndo, canRedo } =
    useCanvasStore();

  const handleToolChange = (tool: ToolType) => {
    setCurrentTool(tool);
    if (canvas) {
      // 根据工具类型设置画布模式
      if (tool === "select") {
        canvas.isDrawingMode = false;
        canvas.selection = true;
      } else if (tool === "draw") {
        canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.freeDrawingBrush.width = 2;
        canvas.freeDrawingBrush.color = "#000000";
      } else {
        canvas.isDrawingMode = false;
        canvas.selection = false;
      }
    }
  };

  const addShape = (shapeType: string) => {
    if (!canvas) return;

    const shape = createShape(shapeType);
    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
    }
  };

  const addText = () => {
    if (!canvas) return;

    const text = createText("Click to edit");
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.renderAll();
  };

  const handleExport = (format: "png" | "jpg" | "svg") => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: format === "jpg" ? "jpeg" : format,
      quality: format === "jpg" ? 0.8 : 1,
    });

    // 创建下载链接
    const link = document.createElement("a");
    link.download = `canvas-export.${format}`;
    link.href = dataURL;
    link.click();
  };

  return (
    <TooltipProvider>
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-2">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-800">Canvas Editor</h1>
          <Separator orientation="vertical" className="h-6" />
        </div>

        {/* 选择工具 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === "select" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToolChange("select")}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>选择工具 (V)</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        {/* 形状工具 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Square className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>形状工具</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addShape("rectangle")}>
              <Square className="h-4 w-4 mr-2" />
              矩形 (R)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShape("circle")}>
              <Circle className="h-4 w-4 mr-2" />
              圆形 (O)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShape("triangle")}>
              <Triangle className="h-4 w-4 mr-2" />
              三角形
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 文本工具 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={addText}>
              <Type className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>添加文本 (T)</p>
          </TooltipContent>
        </Tooltip>

        {/* 绘图工具 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === "draw" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToolChange("draw")}
            >
              <Brush className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>画笔工具 (B)</p>
          </TooltipContent>
        </Tooltip>

        {/* 图像工具 */}
        <FileUpload>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>上传图片</p>
            </TooltipContent>
          </Tooltip>
        </FileUpload>

        {/* 分隔符 */}
        <Separator orientation="vertical" className="h-6" />

        {/* 历史操作 */}
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo()}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>撤销 (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo()}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>重做 (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* 右侧工具 */}
        <div className="flex-1" />

        {/* 预览 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>预览</p>
          </TooltipContent>
        </Tooltip>

        {/* 导出 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>导出</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport("png")}>
              导出为 PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("jpg")}>
              导出为 JPG
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("svg")}>
              导出为 SVG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
