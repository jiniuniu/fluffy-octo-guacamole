// components/editor/SVGEditor.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditorStore } from "@/lib/editor/editorStore";
import { TopToolbar } from "./toolbar/TopToolbar";
import { LeftToolbar } from "./toolbar/LeftToolbar";
import { FabricCanvas } from "./canvas/FabricCanvas";
import { ExitConfirmDialog } from "./dialogs/ExitConfirmDialog";
import { GenerationRecord } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { downloadFile } from "@/lib/utils";

interface SVGEditorProps {
  record: GenerationRecord;
  onSvgChange?: (newSvgCode: string) => void;
  onExit?: () => void;
}

export function SVGEditor({ record, onSvgChange, onExit }: SVGEditorProps) {
  const [currentSvgCode, setCurrentSvgCode] = useState(record.svg_code);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedCode, setLastSavedCode] = useState(record.svg_code);
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "error" | null
  >(null);

  const { setEditing, reset, canvas } = useEditorStore();

  // 初始化编辑器
  useEffect(() => {
    setEditing(true);

    return () => {
      // 清理编辑器状态
      reset();
    };
  }, [setEditing, reset]);

  // 监听 SVG 变化
  const handleSvgChange = (newSvgCode: string) => {
    setCurrentSvgCode(newSvgCode);
    setHasUnsavedChanges(newSvgCode !== lastSavedCode);
  };

  // 保存修改
  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setSaveStatus("saving");

    try {
      // 调用父组件的保存回调
      if (onSvgChange) {
        onSvgChange(currentSvgCode);
      }

      setLastSavedCode(currentSvgCode);
      setHasUnsavedChanges(false);
      setSaveStatus("saved");

      // 3秒后清除保存状态提示
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error("保存失败:", error);
      setSaveStatus("error");

      setTimeout(() => {
        setSaveStatus(null);
      }, 5000);
    }
  }, [hasUnsavedChanges, onSvgChange, currentSvgCode]);

  // 导出 SVG
  const handleExport = useCallback(() => {
    if (!canvas) return;

    try {
      const svgString = canvas.toSVG();
      downloadFile(
        svgString,
        `physics_animation_${record.id}_edited.svg`,
        "image/svg+xml"
      );
    } catch (error) {
      console.error("导出失败:", error);
    }
  }, [canvas, record.id]);

  // 退出编辑
  const handleExit = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      onExit?.();
    }
  }, [hasUnsavedChanges, onExit]);

  // 确认退出（不保存）
  const handleConfirmExit = useCallback(() => {
    setShowExitDialog(false);
    onExit?.();
  }, [onExit]);

  // 保存并退出
  const handleSaveAndExit = useCallback(async () => {
    await handleSave();
    setShowExitDialog(false);
    onExit?.();
  }, [handleSave, onExit]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S 保存
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      // Escape 退出
      if (e.key === "Escape") {
        e.preventDefault();
        handleExit();
      }

      // Ctrl+Z 撤销（在 TopToolbar 中处理）
      // Ctrl+Y 重做（在 TopToolbar 中处理）
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleExit]); // 更新依赖数组

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* 保存状态提示 */}
      {saveStatus && (
        <div className="absolute top-4 right-4 z-50">
          <Alert
            variant={saveStatus === "error" ? "destructive" : "default"}
            className="w-auto"
          >
            <AlertDescription>
              {saveStatus === "saving" && "正在保存..."}
              {saveStatus === "saved" && "✅ 已保存"}
              {saveStatus === "error" && "❌ 保存失败"}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* 顶部工具栏 */}
      <TopToolbar
        onSave={handleSave}
        onExit={handleExit}
        onExport={handleExport}
      />

      {/* 主编辑区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧工具栏 */}
        <LeftToolbar />

        {/* 编辑画布 */}
        <div className="flex-1 bg-gray-50">
          <FabricCanvas
            svgCode={record.svg_code}
            onSvgChange={handleSvgChange}
            className="w-full h-full p-4"
          />
        </div>
      </div>

      {/* 退出确认对话框 */}
      <ExitConfirmDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirmExit={handleConfirmExit}
        onSaveAndExit={handleSaveAndExit}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* 底部状态栏 */}
      <div className="h-6 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>编辑中: {record.question}</span>
          {hasUnsavedChanges && (
            <span className="text-orange-600">• 有未保存的修改</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Ctrl+S 保存 • Esc 退出</span>
        </div>
      </div>
    </div>
  );
}
