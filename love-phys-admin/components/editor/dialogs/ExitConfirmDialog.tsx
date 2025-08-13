// components/editor/dialogs/ExitConfirmDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Save, X } from "lucide-react";

interface ExitConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  onSaveAndExit: () => void;
  hasUnsavedChanges: boolean;
}

export function ExitConfirmDialog({
  open,
  onClose,
  onConfirmExit,
  onSaveAndExit,
  hasUnsavedChanges,
}: ExitConfirmDialogProps) {
  if (!hasUnsavedChanges) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            退出编辑器
          </DialogTitle>
          <DialogDescription>
            您有未保存的修改。您希望如何处理这些更改？
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 修改提示 */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">有未保存的修改</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              如果不保存就退出，您的修改将会丢失。
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={onSaveAndExit}
              className="w-full justify-start"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              保存并退出
            </Button>

            <Button
              variant="outline"
              onClick={onConfirmExit}
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              size="lg"
            >
              <X className="w-4 h-4 mr-2" />
              不保存，直接退出
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
              size="lg"
            >
              取消
            </Button>
          </div>

          {/* 提示信息 */}
          <div className="text-xs text-gray-500 text-center">
            您也可以使用 Ctrl+S 保存，或按 Esc 键退出
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
