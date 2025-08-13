// components/editor/toolbar/TopToolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { fabric } from "fabric";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Save,
  Undo,
  Redo,
  Download,
  X,
  Trash2,
  Copy,
  Clipboard,
  Grid3X3,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor/editorStore";
import { useState } from "react";

interface TopToolbarProps {
  onSave?: () => void;
  onExit?: () => void;
  onExport?: () => void;
}

export function TopToolbar({ onSave, onExit, onExport }: TopToolbarProps) {
  const [showGrid, setShowGrid] = useState(false);
  const { canUndo, canRedo, undo, redo, canvas, selectedObjects } =
    useEditorStore();

  const handleUndo = () => {
    const prevState = undo();
    if (prevState && canvas) {
      canvas.loadFromJSON(prevState, () => {
        canvas.renderAll();
      });
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState && canvas) {
      canvas.loadFromJSON(nextState, () => {
        canvas.renderAll();
      });
    }
  };

  const handleDelete = () => {
    if (!canvas || selectedObjects.length === 0) return;

    selectedObjects.forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const handleCopy = () => {
    if (!canvas || selectedObjects.length === 0) return;

    // 简单的复制实现
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 10,
          top: (cloned.top || 0) + 10,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      });
    }
  };

  const handleSelectAll = () => {
    if (!canvas) return;

    const allObjects = canvas.getObjects();
    if (allObjects.length > 0) {
      canvas.discardActiveObject();
      const selection = new fabric.ActiveSelection(allObjects, {
        canvas: canvas,
      });
      canvas.setActiveObject(selection);
      canvas.renderAll();
    }
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
    // 这里可以实现网格显示逻辑
    if (canvas) {
      // 简单的网格背景切换
      if (!showGrid) {
        canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
      } else {
        // 可以添加网格图案
        canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
      }
    }
  };

  return (
    <TooltipProvider>
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        {/* 左侧 - 编辑操作 */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 mr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="h-8 px-2"
                >
                  <Undo className="w-4 h-4" />
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
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="h-8 px-2"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>重做 (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-6 bg-gray-300 mr-4"></div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={selectedObjects.length === 0}
                  className="h-8 px-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>复制 (Ctrl+C)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={selectedObjects.length === 0}
                  className="h-8 px-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>删除 (Delete)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8 px-2"
                >
                  <Clipboard className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>全选 (Ctrl+A)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 中间 - 标题 */}
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-700">SVG 编辑器</h2>
          {selectedObjects.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              已选择 {selectedObjects.length} 个对象
            </span>
          )}
        </div>

        {/* 右侧 - 视图和操作 */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 mr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleGrid}
                  className="h-8 px-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>显示网格</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-6 bg-gray-300 mr-4"></div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Save className="w-4 h-4 mr-1" />
                  保存
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>保存修改 (Ctrl+S)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                  className="h-8 px-3"
                >
                  <Download className="w-4 h-4 mr-1" />
                  导出
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>导出 SVG</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExit}
                  className="h-8 px-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>退出编辑</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
