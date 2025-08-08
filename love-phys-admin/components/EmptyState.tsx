// components/EmptyState.tsx
"use client";

export function EmptyState() {
  return (
    <div className="h-full bg-white flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            开始生成新内容
          </h3>
          <p className="text-gray-600 mb-6">
            在左侧输入物理问题并选择模型，或选择历史记录查看内容
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
              1
            </span>
            <span>输入物理问题</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
              2
            </span>
            <span>选择AI模型</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
              3
            </span>
            <span>生成内容和动画</span>
          </div>
        </div>
      </div>
    </div>
  );
}
