"use client";

import {
  Copy,
  Trash2,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  Square,
  Circle as CircleIcon,
  Minus,
  Plus,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCanvasStore } from "@/store/canvas-store";
import { fabric } from "fabric";
import ColorPicker from "../controls/ColorPicker";

interface ObjectControlsProps {
  object: fabric.Object;
}

export default function ObjectControls({ object }: ObjectControlsProps) {
  const { canvas } = useCanvasStore();

  // 检查是否为文本对象
  const isTextObject =
    object.type === "textbox" ||
    object.type === "i-text" ||
    object.type === "text";

  // 基础操作
  const duplicateObject = () => {
    if (!canvas || !object) return;

    object.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  const deleteObject = () => {
    if (!canvas || !object) return;

    canvas.remove(object);
    canvas.renderAll();
  };

  const toggleLock = () => {
    if (!canvas || !object) return;

    const isLocked = object.lockMovementX || object.lockMovementY;
    object.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      selectable: isLocked,
    });

    if (!isLocked) {
      canvas.discardActiveObject();
    }

    canvas.renderAll();
  };

  const toggleVisibility = () => {
    if (!canvas || !object) return;

    object.set("visible", !object.visible);
    canvas.renderAll();
  };

  // 图层控制
  const bringToFront = () => {
    if (!canvas || !object) return;
    canvas.bringToFront(object);
    canvas.renderAll();
  };

  const sendToBack = () => {
    if (!canvas || !object) return;
    canvas.sendToBack(object);
    canvas.renderAll();
  };

  const bringForward = () => {
    if (!canvas || !object) return;
    canvas.bringForward(object);
    canvas.renderAll();
  };

  const sendBackwards = () => {
    if (!canvas || !object) return;
    canvas.sendBackwards(object);
    canvas.renderAll();
  };

  // 颜色控制
  const handleFillColorChange = (color: string) => {
    if (!canvas || !object) return;
    object.set("fill", color);
    canvas.renderAll();
  };

  const handleStrokeColorChange = (color: string) => {
    if (!canvas || !object) return;

    object.set("stroke", color);
    if (!object.strokeWidth || object.strokeWidth === 0) {
      object.set("strokeWidth", 2);
    }
    canvas.renderAll();
  };

  const handleBackgroundColorChange = (color: string) => {
    if (!canvas || !object || !isTextObject) return;

    (object as fabric.Textbox).set("backgroundColor", color);
    canvas.renderAll();
  };

  // 边框控制
  const handleStrokeWidthChange = (delta: number) => {
    if (!canvas || !object) return;

    const currentWidth = object.strokeWidth || 0;
    const newWidth = Math.max(0, Math.min(20, currentWidth + delta));

    object.set("strokeWidth", newWidth);
    canvas.renderAll();

    // 强制更新组件状态
    canvas.fire("path:created", {});
  };

  const handleStrokeStyleChange = (style: number[] | undefined) => {
    if (!canvas || !object) return;

    object.set("strokeDashArray", style);
    canvas.renderAll();
  };

  const removeStroke = () => {
    if (!canvas || !object) return;

    object.set({
      stroke: undefined,
      strokeWidth: 0,
      strokeDashArray: undefined,
    });
    canvas.renderAll();
  };

  const removeBackground = () => {
    if (!canvas || !object || !isTextObject) return;

    (object as fabric.Textbox).set("backgroundColor", "");
    canvas.renderAll();
  };

  // 获取当前状态
  const getCurrentFillColor = () => {
    return (object.fill as string) || (isTextObject ? "#000000" : "#3b82f6");
  };

  const getCurrentStrokeColor = () => {
    return (object.stroke as string) || "#000000";
  };

  const getCurrentBackgroundColor = () => {
    if (!isTextObject) return "#ffffff";
    return ((object as fabric.Textbox).backgroundColor as string) || "#ffffff";
  };

  const getCurrentStrokeWidth = () => {
    return object.strokeWidth || 0;
  };

  const hasStroke = () => {
    return object.stroke && object.strokeWidth && object.strokeWidth > 0;
  };

  const hasBackground = () => {
    if (!isTextObject) return false;
    return !!(object as fabric.Textbox).backgroundColor;
  };

  const isLocked = object.lockMovementX || object.lockMovementY;
  const isVisible = object.visible !== false;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2">
        {/* 复制和删除 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={duplicateObject}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>复制对象</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteObject}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>删除对象</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        {/* 填充颜色 */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <div className="relative">
                    {isTextObject ? (
                      <Type className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" fill="currentColor" />
                    )}
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-sm border border-gray-300"
                      style={{ backgroundColor: getCurrentFillColor() }}
                    />
                  </div>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              {isTextObject ? "文字颜色" : "填充颜色"}
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-3" side="bottom">
            <ColorPicker
              color={getCurrentFillColor()}
              onChange={handleFillColorChange}
            />
          </PopoverContent>
        </Popover>

        {/* 边框控制 - 整合到一个菜单 */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <div className="relative">
                    <CircleIcon
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-sm border border-gray-300"
                      style={{
                        backgroundColor: hasStroke()
                          ? getCurrentStrokeColor()
                          : "transparent",
                      }}
                    />
                  </div>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>边框设置</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-64 p-4" side="bottom">
            <div className="space-y-4">
              {/* 颜色选择 */}
              <div>
                <div className="text-sm font-medium mb-2">边框颜色</div>
                <ColorPicker
                  color={getCurrentStrokeColor()}
                  onChange={handleStrokeColorChange}
                />
              </div>

              {/* 宽度控制 */}
              <div>
                <div className="text-sm font-medium mb-2">边框宽度</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStrokeWidthChange(-1)}
                    disabled={getCurrentStrokeWidth() <= 0}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <div className="flex-1 text-center">
                    <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                      {getCurrentStrokeWidth()}px
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStrokeWidthChange(1)}
                    disabled={getCurrentStrokeWidth() >= 20}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* 样式选择 */}
              {hasStroke() && (
                <div>
                  <div className="text-sm font-medium mb-2">边框样式</div>
                  <div className="grid grid-cols-1 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStrokeStyleChange(undefined)}
                      className="justify-start h-8"
                    >
                      <div className="w-8 h-0.5 bg-current mr-2"></div>
                      实线
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStrokeStyleChange([5, 5])}
                      className="justify-start h-8"
                    >
                      <div className="w-8 h-0.5 border-t-2 border-dashed border-current mr-2"></div>
                      虚线
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStrokeStyleChange([2, 2])}
                      className="justify-start h-8"
                    >
                      <div className="w-8 h-0.5 border-t-2 border-dotted border-current mr-2"></div>
                      点线
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStrokeStyleChange([10, 5, 2, 5])}
                      className="justify-start h-8"
                    >
                      <div className="w-8 h-0.5 mr-2 bg-current opacity-50"></div>
                      点划线
                    </Button>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2 pt-2 border-t">
                {hasStroke() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeStroke}
                    className="flex-1"
                  >
                    移除边框
                  </Button>
                )}
                {!hasStroke() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStrokeColorChange("#000000")}
                    className="flex-1"
                  >
                    添加边框
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 文本框背景色 */}
        {isTextObject && (
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <div className="relative">
                      <Square
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-sm border border-gray-300"
                        style={{
                          backgroundColor: hasBackground()
                            ? getCurrentBackgroundColor()
                            : "transparent",
                        }}
                      />
                    </div>
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>背景颜色</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-3" side="bottom">
              <div className="space-y-3">
                <ColorPicker
                  color={getCurrentBackgroundColor()}
                  onChange={handleBackgroundColorChange}
                />
                {hasBackground() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeBackground}
                    className="w-full"
                  >
                    移除背景
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Separator orientation="vertical" className="h-6" />

        {/* 锁定和可见性 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isLocked ? "default" : "ghost"}
              size="sm"
              onClick={toggleLock}
            >
              {isLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isLocked ? "解锁对象" : "锁定对象"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={!isVisible ? "default" : "ghost"}
              size="sm"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isVisible ? "隐藏对象" : "显示对象"}</TooltipContent>
        </Tooltip>

        {/* 图层控制 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Layers className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>图层控制</TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={bringToFront}>
              <ArrowUp className="h-4 w-4 mr-2" />
              置于顶层
            </DropdownMenuItem>
            <DropdownMenuItem onClick={bringForward}>
              <ChevronUp className="h-4 w-4 mr-2" />
              向上一层
            </DropdownMenuItem>
            <DropdownMenuItem onClick={sendBackwards}>
              <ChevronDown className="h-4 w-4 mr-2" />
              向下一层
            </DropdownMenuItem>
            <DropdownMenuItem onClick={sendToBack}>
              <ArrowDown className="h-4 w-4 mr-2" />
              置于底层
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
