"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { architectureTemplates } from "@/lib/diagram/utils";
import { useState, useEffect } from "react";
import { Send } from "lucide-react";

interface SidebarProps {
  onPromptChange: (prompt: string) => void;
  onTemplateSelect: (template: keyof typeof architectureTemplates) => void;
  onGenerate?: (prompt: string) => void; // 新增生成回调
  initialPrompt?: string;
}

export function Sidebar({
  onPromptChange,
  onTemplateSelect,
  onGenerate,
  initialPrompt = "",
}: SidebarProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    onPromptChange(value);
  };

  const handleGenerate = () => {
    if (onGenerate && prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  const handleTemplateSelect = (
    templateKey: keyof typeof architectureTemplates
  ) => {
    const template = architectureTemplates[templateKey];
    handlePromptChange(template.prompt);
    onTemplateSelect(templateKey);
  };

  return (
    <div className="w-80 border-r bg-background p-4 overflow-y-auto space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">架构描述</h3>
        <p className="text-sm text-muted-foreground mb-4">
          输入您的架构需求或选择预设模板
        </p>
        <div className="relative">
          <Textarea
            placeholder="描述您想要生成的架构图，例如：一个包含用户服务、订单服务和支付服务的微服务架构"
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            className="min-h-32 pr-12 resize-none"
          />
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="absolute bottom-2 right-2 h-8 w-8 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(architectureTemplates).map(([key, template]) => (
          <Button
            key={key}
            variant="outline"
            className="w-full h-auto py-3 px-4 text-left justify-start"
            onClick={() =>
              handleTemplateSelect(key as keyof typeof architectureTemplates)
            }
          >
            <div className="w-full text-left">
              <div className="text-xs text-muted-foreground line-clamp-3 whitespace-normal">
                {template.prompt}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
