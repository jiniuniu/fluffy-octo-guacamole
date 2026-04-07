"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use, useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AnswerList } from "@/components/AnswerList";
import { ActivityLog } from "@/components/ActivityLog";
import { Dashboard } from "@/components/Dashboard";
import { PublicToggle } from "@/components/PublicToggle";
import { BarChart2Icon, ActivityIcon, MenuIcon, XIcon } from "lucide-react";

export default function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const questionId = id as Id<"questions">;
  const question = useQuery(api.questions.getById, { id: questionId });
  const retrySimulation = useMutation(api.questions.retrySimulation);
  const [retrying, setRetrying] = useState(false);

  // Mobile states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // "dashboard" | "activity" | null
  const [bottomSheet, setBottomSheet] = useState<"dashboard" | "activity" | null>(null);

  // Auto-open activity log when processing, auto-close when done
  useEffect(() => {
    if (question?.status === "processing") {
      setBottomSheet("activity");
    } else if (question?.status === "done" || question?.status === "failed") {
      setBottomSheet((prev) => (prev === "activity" ? null : prev));
    }
  }, [question?.status]);

  async function handleRetry() {
    setRetrying(true);
    try {
      await retrySimulation({ id: questionId });
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar: hidden on mobile, fixed on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Mobile sidebar drawer */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Center: question + answers */}
      <div className="flex flex-1 flex-col overflow-hidden md:ml-64 md:mr-80">

        {/* Mobile top bar — just menu button, no back link */}
        <header className="md:hidden shrink-0 flex items-center px-4 h-12 bg-background border-b border-border/30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MenuIcon className="size-5" />
          </button>
        </header>

        {/* Question hero header */}
        <header className="relative shrink-0 px-4 pt-6 pb-6 md:px-12 md:pt-10 md:pb-8 bg-background">
          <div className="max-w-3xl mx-auto">
            {question ? (
              <>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={question.status} />
                    {question.status === "failed" && (
                      <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="text-[10px] font-bold tracking-widest uppercase text-secondary hover:text-secondary/80 transition-colors disabled:opacity-50"
                      >
                        {retrying ? "重试中..." : "↺ 重试"}
                      </button>
                    )}
                  </div>
                  <PublicToggle questionId={questionId} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
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

        {/* Processing shimmer line */}
        {question?.status === "processing" && (
          <div className="shrink-0 h-px w-full overflow-hidden bg-border/20">
            <div className="h-full w-1/3 bg-linear-to-r from-transparent via-primary to-transparent animate-[shimmer_1.8s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Answers */}
        <div className="flex-1 overflow-y-auto px-4 pb-24 md:px-12 md:pb-10">
          <div className="max-w-3xl mx-auto">
            <AnswerList questionId={questionId} />
          </div>
        </div>
      </div>

      {/* Right panel: desktop only */}
      <aside className="hidden md:flex w-80 h-screen fixed right-0 top-0 bg-[#f6f3f2] flex-col overflow-hidden no-scrollbar">
        <div className="shrink-0 px-6 pt-8 pb-4">
          <Dashboard questionId={questionId} />
        </div>
        <div className="flex-1 overflow-hidden border-t border-border/30 px-6 pt-4 pb-4">
          <ActivityLog questionId={questionId} />
        </div>
      </aside>

      {/* Mobile bottom action bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around bg-background border-t border-border/30 px-6 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 text-muted-foreground"
        >
          <MenuIcon className="size-5" />
          <span className="text-[10px] font-semibold tracking-wider">历史</span>
        </button>
        <button
          onClick={() => setBottomSheet(bottomSheet === "dashboard" ? null : "dashboard")}
          className={`flex flex-col items-center gap-1 transition-colors ${bottomSheet === "dashboard" ? "text-primary" : "text-muted-foreground"}`}
        >
          <BarChart2Icon className="size-5" />
          <span className="text-[10px] font-semibold tracking-wider">统计</span>
        </button>
        <button
          onClick={() => setBottomSheet(bottomSheet === "activity" ? null : "activity")}
          className={`flex flex-col items-center gap-1 transition-colors ${bottomSheet === "activity" ? "text-primary" : "text-muted-foreground"}`}
        >
          <ActivityIcon className="size-5" />
          <span className="text-[10px] font-semibold tracking-wider">动态</span>
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {bottomSheet && (
        <>
          {/* Backdrop only for dashboard (full overlay); activity log is compact, no backdrop */}
          {bottomSheet === "dashboard" && (
            <div
              className="md:hidden fixed inset-0 z-20 bg-black/20"
              onClick={() => setBottomSheet(null)}
            />
          )}
          <div className={`md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#f6f3f2] rounded-t-xl flex flex-col overflow-hidden shadow-lg transition-all ${
            bottomSheet === "activity"
              ? "max-h-[35vh]"
              : "max-h-[65vh]"
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0 border-b border-border/20">
              <div className="flex items-center gap-2">
                {bottomSheet === "activity" && question?.status === "processing" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                  {bottomSheet === "dashboard" ? "数据统计" : "实时动态"}
                </span>
              </div>
              <button onClick={() => setBottomSheet(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <XIcon className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 no-scrollbar">
              {bottomSheet === "dashboard" ? (
                <Dashboard questionId={questionId} />
              ) : (
                <ActivityLog questionId={questionId} />
              )}
            </div>
          </div>
        </>
      )}
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
  if (status === "failed") {
    return (
      <span className="text-[10px] font-bold tracking-widest uppercase text-secondary">
        处理失败
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
      等待中
    </span>
  );
}
