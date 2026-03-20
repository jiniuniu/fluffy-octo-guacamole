"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { use } from "react";
import { useRouter } from "next/navigation";
import { AnswerList } from "@/components/AnswerList";
import { ActivityLog } from "@/components/ActivityLog";
import { Dashboard } from "@/components/Dashboard";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeftIcon } from "lucide-react";

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

export default function PublicQuestionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const question = useQuery(api.questions.getBySlug, { slug });

  if (question === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">找不到该问题</p>
      </div>
    );
  }

  const questionId = question?._id as Id<"questions"> | undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* main feed */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
        {/* header */}
        <div className="shrink-0 border-b border-border px-4 py-3">
          <div className="mx-auto max-w-3xl flex items-start gap-2">
            <button
              onClick={() => router.push("/")}
              className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="size-4" />
            </button>
            {question ? (
              <>
                <p className="flex-1 text-sm font-medium leading-relaxed">
                  {question.text}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[question.status]}`}
                >
                  {STATUS_TEXT[question.status]}
                </span>
              </>
            ) : (
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            )}
          </div>
        </div>

        {/* answers */}
        <div className="flex-1 overflow-y-auto">
          {questionId && <AnswerList questionId={questionId} readonly />}
        </div>
      </div>

      {/* right panel */}
      <div className="flex w-80 shrink-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border">
          {questionId && <Dashboard questionId={questionId} readonly />}
        </div>
        <div className="flex-1 overflow-hidden">
          {questionId && <ActivityLog questionId={questionId} />}
        </div>
      </div>
    </div>
  );
}
