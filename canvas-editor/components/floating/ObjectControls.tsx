"use client";

import {
  Copy,
  Trash2,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Palette,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ChevronUp,
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
      selectable: isLocked, // 锁定时不可选中
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

  const handleColorChange = (color: string) => {
    if (!canvas || !object) return;

    if (object.type === "textbox" || object.type === "i-text") {
      object.set("fill", color);
    } else {
      object.set("fill", color);
    }

    canvas.renderAll();
  };

  const isLocked = object.lockMovementX || object.lockMovementY;
  const isVisible = object.visible !== false;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2">
        {/* 复制 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={duplicateObject}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>复制对象</p>
          </TooltipContent>
        </Tooltip>

        {/* 删除 */}
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
          <TooltipContent>
            <p>删除对象</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        {/* 锁定/解锁 */}
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
          <TooltipContent>
            <p>{isLocked ? "解锁对象" : "锁定对象"}</p>
          </TooltipContent>
        </Tooltip>

        {/* 显示/隐藏 */}
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
          <TooltipContent>
            <p>{isVisible ? "隐藏对象" : "显示对象"}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

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
            <TooltipContent>
              <p>图层控制</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={bringToFront}>
              <ArrowUp className="h-4 w-4 mr-2" />
              置于顶层
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => bringForward()}>
              <ChevronUp className="h-4 w-4 mr-2" />
              向上一层
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => sendBackwards()}>
              <ChevronDown className="h-4 w-4 mr-2" />
              向下一层
            </DropdownMenuItem>
            <DropdownMenuItem onClick={sendToBack}>
              <ArrowDown className="h-4 w-4 mr-2" />
              置于底层
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 颜色选择器 */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <div className="flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    <div
                      className="w-3 h-3 rounded border border-gray-300"
                      style={{
                        backgroundColor: (object.fill as string) || "#000000",
                      }}
                    />
                  </div>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>更改颜色</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-3" side="bottom">
            <ColorPicker
              color={(object.fill as string) || "#000000"}
              onChange={handleColorChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
