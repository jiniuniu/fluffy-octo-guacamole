"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PersonaCard } from "@/components/PersonaCard";
import { useEffect, useRef } from "react";

const ACTION_META: Record<string, { label: string; color: string }> = {
  answer:        { label: "发表了回答",  color: "text-primary" },
  reply_answer:  { label: "回复了回答",  color: "text-[#516170]" },
  like_answer:   { label: "点赞了回答",  color: "text-secondary" },
  like_question: { label: "点赞了问题",  color: "text-secondary" },
  ignore:        { label: "路过",        color: "text-muted-foreground/50" },
};

export function ActivityLog({ questionId }: { questionId: Id<"questions"> }) {
  const logs = useQuery(api.activity_log.byQuestion, { question_id: questionId });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs?.length]);

  return (
    <div className="flex h-full flex-col">
      <h2 className="shrink-0 mb-4 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
        实时动态
      </h2>
      <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar">
        {!logs && (
          <p className="text-xs text-muted-foreground/50">等待中...</p>
        )}
        {logs?.map((log) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const persona = (log as any).persona;
          const meta = ACTION_META[log.action] ?? { label: log.action, color: "text-muted-foreground" };

          return (
            <div key={log._id} className="flex items-start gap-1.5 text-xs">
              {persona ? (
                <PersonaCard persona={persona}>
                  <span className="shrink-0 cursor-default rounded bg-[#eae8e7] px-1.5 py-0.5 font-medium text-foreground hover:bg-[#e4e2e2] transition-colors">
                    {persona.demo.city} · {persona.demo.occupation}
                  </span>
                </PersonaCard>
              ) : (
                <span className="shrink-0 rounded bg-[#eae8e7] px-1.5 py-0.5 font-medium text-foreground">
                  ...
                </span>
              )}
              <span className={`mt-0.5 ${meta.color}`}>{meta.label}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
