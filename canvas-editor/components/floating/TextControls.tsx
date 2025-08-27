"use client";

import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanvasStore } from "@/store/canvas-store";
import { fabric } from "fabric";

interface TextControlsProps {
  object: fabric.Textbox;
}

export default function TextControls({ object }: TextControlsProps) {
  const { canvas } = useCanvasStore();

  const toggleBold = () => {
    if (!canvas || !object) return;

    const currentWeight = object.fontWeight;
    object.set("fontWeight", currentWeight === "bold" ? "normal" : "bold");
    canvas.renderAll();
  };

  const toggleItalic = () => {
    if (!canvas || !object) return;

    const currentStyle = object.fontStyle;
    object.set("fontStyle", currentStyle === "italic" ? "normal" : "italic");
    canvas.renderAll();
  };

  const toggleUnderline = () => {
    if (!canvas || !object) return;

    object.set("underline", !object.underline);
    canvas.renderAll();
  };

  const setTextAlign = (align: "left" | "center" | "right") => {
    if (!canvas || !object) return;

    object.set("textAlign", align);
    canvas.renderAll();
  };

  const changeFontSize = (delta: number) => {
    if (!canvas || !object) return;

    const currentSize = object.fontSize || 20;
    const newSize = Math.max(8, Math.min(200, currentSize + delta));
    object.set("fontSize", newSize);
    canvas.renderAll();
  };

  const isBold = object.fontWeight === "bold";
  const isItalic = object.fontStyle === "italic";
  const isUnderlined = object.underline;
  const textAlign = object.textAlign || "left";

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2">
        {/* 字体大小控制 */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeFontSize(-2)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>减小字号</p>
            </TooltipContent>
          </Tooltip>

          <span className="text-xs px-2 py-1 bg-gray-100 rounded min-w-[2rem] text-center">
            {Math.round(object.fontSize || 20)}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeFontSize(2)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>增大字号</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 字体样式 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isBold ? "default" : "ghost"}
              size="sm"
              onClick={toggleBold}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>粗体</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isItalic ? "default" : "ghost"}
              size="sm"
              onClick={toggleItalic}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>斜体</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isUnderlined ? "default" : "ghost"}
              size="sm"
              onClick={toggleUnderline}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>下划线</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 对齐方式 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={textAlign === "left" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTextAlign("left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>左对齐</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={textAlign === "center" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTextAlign("center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>居中对齐</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={textAlign === "right" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTextAlign("right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>右对齐</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
