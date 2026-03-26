"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { use } from "react";
import { AnswerList } from "@/components/AnswerList";
import { TopNav } from "@/components/TopNav";
import { StanceDistribution } from "@/components/StanceDistribution";
import { Id } from "@/convex/_generated/dataModel";

export default function PublicQuestionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const question = useQuery(api.questions.getBySlug, { slug });
  const questionId = question?._id as Id<"questions"> | undefined;
  const stats = useQuery(api.questions.stats, questionId ? { id: questionId } : "skip");

  if (question === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">找不到该问题</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav back />

      {/* Centered content */}
      <main className="mx-auto max-w-2xl px-6 py-12">

        {/* Question header */}
        {question ? (
          <header className="mb-10">
            {question.status === "processing" && (
              <div className="mb-4">
                <StatusBadge status={question.status} />
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
              {(question as any).title ?? question.text}
            </h1>
            {(question as any).description && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {(question as any).description}
              </p>
            )}
            {stats && (stats.stanceCounts?.length ?? 0) > 0 && (
              <div className="mt-6 p-4 bg-[#f6f3f2] rounded-lg">
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3">
                  情绪分布 · {stats.totalAnswers} 条回答 · {stats.saw} 人参与
                </p>
                <StanceDistribution
                  stances={stats.stances}
                  stanceCounts={stats.stanceCounts}
                  variant="full"
                />
              </div>
            )}
          </header>
        ) : (
          <div className="mb-10 space-y-3">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        )}

        {/* Answers */}
        {questionId && <AnswerList questionId={questionId} readonly />}
      </main>
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
