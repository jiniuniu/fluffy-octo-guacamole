"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { architectureTemplates } from "@/lib/diagram/utils";
import { useState, useEffect } from "react";

interface SidebarProps {
  onPromptChange: (prompt: string) => void;
  onTemplateSelect: (template: keyof typeof architectureTemplates) => void;
  initialPrompt?: string;
}

export function Sidebar({ onPromptChange, onTemplateSelect, initialPrompt = "" }: SidebarProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    onPromptChange(value);
  };

  return (
    <div className="w-80 border-r p-4 overflow-y-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>架构描述</CardTitle>
          <CardDescription>输入您的架构需求或选择预设模板</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="描述您想要生成的架构图，例如：一个包含用户服务、订单服务和支付服务的微服务架构"
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            className="min-h-32"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>预设模板</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(architectureTemplates).map(([key, template]) => (
            <Button
              key={key}
              variant="outline"
              className="w-full h-auto py-3 px-4 text-left justify-start"
              onClick={() => {
                handlePromptChange(template.prompt);
                onTemplateSelect(key as keyof typeof architectureTemplates);
              }}
            >
              <div className="w-full text-left">
                <div className="text-sm font-medium mb-1">{template.name}</div>
                <div className="text-xs text-muted-foreground break-words">
                  {template.prompt}
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}