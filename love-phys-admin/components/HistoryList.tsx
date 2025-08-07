"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { GenerationRecord } from "@/lib/types";
import { Button } from "./ui/button";

export function HistoryList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { recentRecords, selectedRecord, setSelectedRecord } = useAppStore();

  // 模拟加载历史记录
  useEffect(() => {
    const mockRecords: GenerationRecord[] = [
      {
        id: "1",
        question: "为什么会有彩虹？",
        explanation:
          "彩虹是太阳光通过空气中的小水珠发生折射、反射和色散而形成的自然光学现象...",
        svg_code: "<svg>彩虹SVG内容</svg>",
        model: "claude",
        status: "success",
        created_at: "2024-01-07T14:30:00Z",
      },
      {
        id: "2",
        question: "波动现象的物理原理",
        explanation: "波动是物质或能量在空间中的传播现象...",
        svg_code: "<svg>波动SVG内容</svg>",
        model: "claude",
        status: "success",
        created_at: "2024-01-07T14:15:00Z",
      },
      {
        id: "3",
        question: "自由落体运动分析",
        explanation: "自由落体运动是只受重力作用的运动...",
        svg_code: "<svg>自由落体SVG内容</svg>",
        model: "qwen",
        status: "success",
        created_at: "2024-01-07T13:00:00Z",
      },
      {
        id: "4",
        question: "电磁感应原理演示",
        explanation: "",
        svg_code: "",
        model: "claude",
        status: "failed",
        created_at: "2024-01-07T12:00:00Z",
        error_message: "生成失败，请重试",
      },
    ];

    if (recentRecords.length === 0) {
      useAppStore.getState().setRecentRecords(mockRecords);
    }
  }, [recentRecords.length]);

  const filteredRecords = recentRecords.filter((record) =>
    record.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="h-full flex flex-col">
      {/* 搜索框 */}
      <div className="p-4 border-b border-gray-200">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 搜索历史记录..."
          className="w-full"
        />
      </div>

      {/* 记录列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-2">📝</div>
            <div className="text-sm">暂无历史记录</div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedRecord?.id === record.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm text-gray-900 truncate pr-2">
                    {record.question}
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      record.status === "success"
                        ? "bg-green-100 text-green-700"
                        : record.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {record.status === "success"
                      ? "✅"
                      : record.status === "failed"
                        ? "❌"
                        : "⏳"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">🤖 {record.model}</span>
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

      {/* 查看更多按钮 */}
      {filteredRecords.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" size="sm" className="w-full">
            查看更多历史记录...
          </Button>
        </div>
      )}
    </div>
  );
}
