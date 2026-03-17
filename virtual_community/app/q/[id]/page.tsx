"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AnswerList } from "@/components/AnswerList";
import { ActivityLog } from "@/components/ActivityLog";
import { Dashboard } from "@/components/Dashboard";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-zinc-100 text-zinc-500",
  processing: "bg-blue-50 text-blue-600 animate-pulse",
  done: "bg-green-50 text-green-600",
};

const STATUS_TEXT: Record<string, string> = {
  pending: "等待中",
  processing: "虚拟网民正在响应...",
  done: "已完成",
};

export default function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const questionId = id as Id<"questions">;
  const question = useQuery(api.questions.getById, { id: questionId });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* main: question + answers (narrow) */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
        {/* question header */}
        <div className="shrink-0 border-b border-border px-4 py-3">
          {question ? (
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm font-medium leading-relaxed">
                {question.text}
              </p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[question.status]}`}
              >
                {STATUS_TEXT[question.status]}
              </span>
            </div>
          ) : (
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          )}
        </div>

        {/* answers */}
        <div className="flex-1 overflow-y-auto">
          <AnswerList questionId={questionId} />
        </div>
      </div>

      {/* right panel: dashboard on top, log below */}
      <div className="flex w-80 shrink-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border">
          <Dashboard questionId={questionId} />
        </div>
        <div className="flex-1 overflow-hidden">
          <ActivityLog questionId={questionId} />
        </div>
      </div>
    </div>
  );
}
