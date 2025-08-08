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
        return "✅";
      case "failed":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "❓";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 搜索和筛选 */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <Input
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          placeholder="🔍 搜索历史记录..."
          className="w-full"
        />

        <div className="flex gap-2">
          <Select
            value={store.modelFilter}
            onValueChange={actions.setModelFilter}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="模型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部模型</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="qwen">Qwen</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={store.statusFilter}
            onValueChange={actions.setStatusFilter}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
              <SelectItem value="pending">生成中</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {store.totalRecords > 0 && (
          <div className="text-xs text-gray-500">
            共找到 {store.totalRecords} 条记录
          </div>
        )}
      </div>

      {/* 记录列表 */}
      <div className="flex-1 overflow-y-auto">
        {store.error ? (
          <div className="p-4 text-center">
            <div className="text-red-600 text-sm mb-2">⚠️ {store.error}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.loadHistory(store.currentPage)}
            >
              重试
            </Button>
          </div>
        ) : store.recentRecords.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-2">📝</div>
            <div className="text-sm">
              {store.searchQuery || store.modelFilter || store.statusFilter
                ? "未找到匹配的记录"
                : "暂无历史记录"}
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {store.recentRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => actions.setSelectedRecord(record)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  store.selectedRecord?.id === record.id
                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm text-gray-900 truncate pr-2 flex-1">
                    {record.question}
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded flex-shrink-0 ${getStatusColor(record.status)}`}
                  >
                    {getStatusIcon(record.status)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">
                    🤖 {record.model === "claude" ? "Claude" : "Qwen"}
                  </span>
                  <span>{getTimeAgo(record.created_at)}</span>
                </div>

                {record.status === "failed" && record.error_message && (
                  <div className="text-xs text-red-600 mt-1 truncate">
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
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.loadHistory(store.currentPage - 1)}
              disabled={store.currentPage <= 1}
            >
              上一页
            </Button>

            <div className="text-xs text-gray-500">
              第 {store.currentPage} / {store.totalPages} 页
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.loadHistory(store.currentPage + 1)}
              disabled={store.currentPage >= store.totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
