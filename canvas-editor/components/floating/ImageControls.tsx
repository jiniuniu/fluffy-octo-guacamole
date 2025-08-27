"use client";

import { RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanvasStore } from "@/store/canvas-store";
import { fabric } from "fabric";

interface ImageControlsProps {
  object: fabric.Image;
}

export default function ImageControls({ object }: ImageControlsProps) {
  const { canvas } = useCanvasStore();

  const rotateImage = () => {
    if (!canvas || !object) return;

    const currentAngle = object.angle || 0;
    object.set("angle", currentAngle + 90);
    canvas.renderAll();
  };

  const flipHorizontal = () => {
    if (!canvas || !object) return;

    object.set("flipX", !object.flipX);
    canvas.renderAll();
  };

  const flipVertical = () => {
    if (!canvas || !object) return;

    object.set("flipY", !object.flipY);
    canvas.renderAll();
  };

  const resetTransform = () => {
    if (!canvas || !object) return;

    object.set({
      flipX: false,
      flipY: false,
      angle: 0,
    });
    canvas.renderAll();
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2">
        {/* 旋转 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={rotateImage}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>旋转 90°</p>
          </TooltipContent>
        </Tooltip>

        {/* 水平翻转 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={object.flipX ? "default" : "ghost"}
              size="sm"
              onClick={flipHorizontal}
            >
              <FlipHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>水平翻转</p>
          </TooltipContent>
        </Tooltip>

        {/* 垂直翻转 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={object.flipY ? "default" : "ghost"}
              size="sm"
              onClick={flipVertical}
            >
              <FlipVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>垂直翻转</p>
          </TooltipContent>
        </Tooltip>

        {/* 重置变换 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetTransform}
              className="text-xs px-2"
            >
              重置
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>重置所有变换</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
