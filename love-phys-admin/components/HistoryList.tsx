// components/SimplifiedHistoryList.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore, useAppActions } from "@/lib/store";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
} from "lucide-react";

export function HistoryList() {
  const store = useAppStore();
  const actions = useAppActions();

  const [localSearchQuery, setLocalSearchQuery] = useState(store.searchQuery);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // 初始加载
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

  const getModelIcon = (model: string) => {
    switch (model) {
      case "claude":
        return <span className="text-sm">💜</span>;
      case "qwen":
        return <span className="text-sm">🧠</span>;
      default:
        return <span className="text-sm">🤖</span>;
    }
  };

  const getModelName = (model: string) => {
    return model === "claude" ? "Claude" : "Qwen";
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          📚 历史记录
        </h2>

        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            placeholder="搜索问题关键词..."
            className="pl-10 bg-white/90 border-gray-200 focus:border-blue-300 rounded-xl h-9"
          />
        </div>

        {/* 统计信息 */}
        {store.totalRecords > 0 && (
          <div className="text-xs text-gray-600 mb-3">
            共{" "}
            <span className="font-medium text-blue-600">
              {store.totalRecords}
            </span>{" "}
            条记录
          </div>
        )}

        {/* 记录列表 */}
        <div className="max-h-[500px] overflow-y-auto">
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
                {store.searchQuery ? "未找到匹配记录" : "暂无历史记录"}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {store.recentRecords.map((record) => (
                <button
                  key={record.id}
                  onClick={() => actions.setSelectedRecord(record)}
                  className={`w-full p-3 text-left rounded-xl border transition-all duration-200 ${
                    store.selectedRecord?.id === record.id
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "bg-white/90 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {/* 问题和状态 */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm text-gray-900 line-clamp-2 pr-2 flex-1">
                      {record.question}
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(record.status)}
                    </div>
                  </div>

                  {/* 模型、音频和时间 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      {getModelIcon(record.model)}
                      <span>{getModelName(record.model)}</span>
                      {record.audio_url && <span>🎤</span>}
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
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 分页 */}
        {store.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
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
        )}
      </div>
    </div>
  );
}
