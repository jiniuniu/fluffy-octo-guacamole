"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AnswerList } from "@/components/AnswerList";
import { ActivityLog } from "@/components/ActivityLog";
import { Dashboard } from "@/components/Dashboard";
import { PublicToggle } from "@/components/PublicToggle";

export default function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const questionId = id as Id<"questions">;
  const question = useQuery(api.questions.getById, { id: questionId });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      {/* Center: question + answers */}
      <div className="flex flex-1 flex-col overflow-hidden ml-64">
        {/* Question hero header */}
        <header className="shrink-0 px-12 pt-10 pb-8 bg-background">
          <div className="max-w-3xl">
            {question ? (
              <>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <StatusBadge status={question.status} />
                  <PublicToggle questionId={questionId} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {question.title ?? question.text}
                </h1>
                {question.description && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {question.description}
                  </p>
                )}
                {!question.title && (
                  <p className="mt-2 text-xs text-muted-foreground/40 italic">
                    正在生成摘要...
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            )}
          </div>
        </header>

        {/* Answers */}
        <div className="flex-1 overflow-y-auto px-12 pb-10">
          <div className="max-w-3xl">
            <AnswerList questionId={questionId} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-80 h-screen fixed right-0 top-0 bg-[#f6f3f2] flex flex-col overflow-hidden no-scrollbar">
        <div className="shrink-0 px-6 pt-8 pb-4">
          <Dashboard questionId={questionId} />
        </div>
        <div className="flex-1 overflow-hidden border-t border-border/30 px-6 pt-4 pb-4">
          <ActivityLog questionId={questionId} />
        </div>
      </aside>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-primary bg-primary/10 px-2.5 py-1 rounded">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        虚拟网民正在响应...
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
        已完成
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
      等待中
    </span>
  );
}
