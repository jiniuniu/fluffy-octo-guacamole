// components/HistoryList.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore, useAppActions } from "@/lib/store";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Bot,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Zap,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export function HistoryList() {
  const store = useAppStore();
  const actions = useAppActions();

  const [localSearchQuery, setLocalSearchQuery] = useState(store.searchQuery);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // 初始加载 - 使用eslint-disable避免依赖问题
  useEffect(() => {
    actions.loadHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 搜索防抖处理
  useEffect(() => {
    if (debouncedSearchQuery !== store.searchQuery) {
      actions.setSearchQuery(debouncedSearchQuery);
      actions.loadHistory(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  // 筛选变化时重新加载
  useEffect(() => {
    actions.loadHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.modelFilter, store.statusFilter]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "刚刚";
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
      case "failed":
        return <XCircle className="w-3.5 h-3.5 text-red-600" />;
      case "pending":
        return <Clock className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 text-green-700 border-green-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case "claude":
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
      case "qwen":
        return <Zap className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Bot className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
      {/* 搜索和筛选区域 */}
      <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm space-y-3">
        {/* 搜索框和筛选器在同一行 */}
        <div className="flex gap-3">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="搜索问题关键词..."
              className="pl-10 bg-white/80 border-gray-200 focus:border-blue-300 rounded-lg h-9"
            />
          </div>

          {/* 模型筛选 */}
          <Select
            value={store.modelFilter}
            onValueChange={actions.setModelFilter}
          >
            <SelectTrigger className="w-24 bg-white/80 border-gray-200 rounded-lg h-9">
              <SelectValue placeholder="模型" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="claude">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>Claude</span>
                </div>
              </SelectItem>
              <SelectItem value="qwen">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-blue-500" />
                  <span>Qwen</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* 状态筛选 */}
          <Select
            value={store.statusFilter}
            onValueChange={actions.setStatusFilter}
          >
            <SelectTrigger className="w-24 bg-white/80 border-gray-200 rounded-lg h-9">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="success">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>成功</span>
                </div>
              </SelectItem>
              <SelectItem value="failed">
                <div className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  <span>失败</span>
                </div>
              </SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  <span>生成中</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 统计信息 - 更紧凑 */}
        {store.totalRecords > 0 && (
          <div className="text-xs text-gray-600 px-1">
            共{" "}
            <span className="font-medium text-blue-600">
              {store.totalRecords}
            </span>{" "}
            条记录
          </div>
        )}
      </div>

      {/* 记录列表 */}
      <div className="flex-1 overflow-y-auto p-3">
        {store.error ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <div className="text-red-600 text-sm text-center">
              {store.error}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.loadHistory(store.currentPage)}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </Button>
          </div>
        ) : store.recentRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <div className="text-sm text-center">
              {store.searchQuery ||
              store.modelFilter !== "all" ||
              store.statusFilter !== "all"
                ? "未找到匹配记录"
                : "暂无历史记录"}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {store.recentRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => actions.setSelectedRecord(record)}
                className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                  store.selectedRecord?.id === record.id
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* 问题和状态 */}
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-sm text-gray-900 line-clamp-2 pr-2 flex-1">
                    {record.question}
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(record.status)}`}
                  >
                    {getStatusIcon(record.status)}
                  </div>
                </div>

                {/* 模型和时间 */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    {getModelIcon(record.model)}
                    <span>{record.model === "claude" ? "Claude" : "Qwen"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{getTimeAgo(record.created_at)}</span>
                  </div>
                </div>

                {/* 错误信息 */}
                {record.status === "failed" && record.error_message && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 line-clamp-1">
                    {record.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      {store.totalPages > 1 && (
        <div className="p-3 border-t border-gray-200 bg-white/80">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.loadHistory(store.currentPage - 1)}
              disabled={store.currentPage <= 1}
              className="flex items-center gap-1 text-xs px-3 py-1.5"
            >
              <ChevronLeft className="w-3 h-3" />
              上一页
            </Button>

            <div className="text-xs text-gray-600">
              {store.currentPage} / {store.totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.loadHistory(store.currentPage + 1)}
              disabled={store.currentPage >= store.totalPages}
              className="flex items-center gap-1 text-xs px-3 py-1.5"
            >
              下一页
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
