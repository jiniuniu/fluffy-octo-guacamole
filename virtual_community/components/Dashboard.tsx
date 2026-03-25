"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function Dashboard({
  questionId,
}: {
  questionId: Id<"questions">;
  readonly?: boolean;
}) {
  const stats = useQuery(api.questions.stats, { id: questionId });
  const question = useQuery(api.questions.getById, { id: questionId });
  const personas = useQuery(api.personas.list);

  if (!stats) return null;

  const total = stats.support + stats.oppose + stats.neutral;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  const isProcessing = question?.status === "processing";
  const totalPersonas = personas?.length ?? 0;
  const progressPct =
    totalPersonas === 0
      ? 0
      : Math.min(100, Math.round((stats.saw / totalPersonas) * 100));

  return (
    <div className="space-y-6">

      {/* Processing progress */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            处理进度
          </span>
          <span className="text-sm font-semibold text-primary tabular-nums">
            {stats.saw} / {totalPersonas}
          </span>
        </div>
        <div className="h-1 w-full bg-[#eae8e7] rounded-full overflow-hidden">
          <div
            className={`h-full bg-primary rounded-full transition-all duration-500 ${isProcessing ? "animate-pulse" : ""}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stance distribution */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-4">
          立场分布
        </span>
        <div className="space-y-3">
          <StanceBar label="支持" pct={pct(stats.support)} color="bg-primary" textColor="text-primary" />
          <StanceBar label="反对" pct={pct(stats.oppose)}  color="bg-secondary" textColor="text-secondary" />
          <StanceBar label="中立" pct={pct(stats.neutral)} color="bg-muted-foreground/40" textColor="text-muted-foreground" />
        </div>
      </div>

      {/* Behavior breakdown */}
      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          行为明细
        </span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <StatRow label="路过"     value={stats.ignored} />
          <StatRow label="点赞问题" value={stats.likedQ} />
          <StatRow label="回答"     value={stats.answered} />
          <StatRow label="点赞回答" value={stats.likedAnswer} />
          <StatRow label="回复"     value={stats.replied} />
        </div>
      </div>

    </div>
  );
}

function StanceBar({
  label, pct, color, textColor,
}: {
  label: string; pct: number; color: string; textColor: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-semibold mb-1">
        <span className="text-muted-foreground tracking-wider">{label}</span>
        <span className={textColor}>{pct}%</span>
      </div>
      <div className="h-0.75 w-full bg-[#eae8e7] rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[10px] text-muted-foreground tracking-wide">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}
