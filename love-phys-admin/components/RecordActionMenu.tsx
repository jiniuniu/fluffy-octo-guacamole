// components/RecordActionMenu.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Copy,
  ExternalLink,
  Download,
  FileJson,
  Trash2,
} from "lucide-react";
import { useAppActions } from "@/lib/store";
import { GenerationRecord } from "@/lib/types";

interface RecordActionMenuProps {
  record: GenerationRecord;
}

export function RecordActionMenu({ record }: RecordActionMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const actions = useAppActions();

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(record.explanation);
      // TODO: 添加成功提示
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const handleCopyQuestion = async () => {
    try {
      await navigator.clipboard.writeText(record.question);
      // TODO: 添加成功提示
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const handleExport = async (format: "svg" | "json") => {
    setIsExporting(true);
    try {
      await actions.exportRecord(record.id, format);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("确定要删除这条记录吗？")) {
      await actions.deleteRecord(record.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" disabled={isExporting}>
          <Settings className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyQuestion}>
          <Copy className="w-4 h-4 mr-2" />
          复制问题
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyText}>
          <Copy className="w-4 h-4 mr-2" />
          复制解释文本
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => window.open(`/history/${record.id}`, "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          在新页面打开
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="w-4 h-4 mr-2" />
          导出JSON格式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("svg")}>
          <Download className="w-4 h-4 mr-2" />
          导出SVG文件
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          删除记录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
