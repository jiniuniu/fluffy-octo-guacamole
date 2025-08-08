// components/ModelSelector.tsx
"use client";

interface ModelSelectorProps {
  selectedModel: "claude" | "qwen";
  onModelChange: (model: "claude" | "qwen") => void;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const models = [
    {
      id: "claude" as const,
      name: "Claude Sonnet 4",
      description: "推荐使用，质量更高，响应详细",
    },
    {
      id: "qwen" as const,
      name: "Qwen Coder Plus",
      description: "响应更快，成本较低，适合简单问题",
    },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        选择AI模型
      </label>
      <div className="grid grid-cols-1 gap-3">
        {models.map((model) => (
          <div
            key={model.id}
            onClick={() => !disabled && onModelChange(model.id)}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedModel === model.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedModel === model.id
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {selectedModel === model.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{model.name}</div>
                <div className="text-xs text-gray-500">{model.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
