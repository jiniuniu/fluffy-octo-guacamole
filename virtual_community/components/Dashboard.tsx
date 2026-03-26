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

  if (!stats) return null;

  const stanceCounts = stats.stanceCounts ?? [];
  const getCount = (stance: string) => stanceCounts.find((s) => s.stance === stance)?.count ?? 0;
  const total = stanceCounts.reduce((s, e) => s + e.count, 0);
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  const isProcessing = question?.status === "processing";
  const simulationSize = stats.simulation_size ?? 0;
  const progressPct =
    simulationSize === 0
      ? 0
      : Math.min(100, Math.round((stats.saw / simulationSize) * 100));

  return (
    <div className="space-y-6">

      {/* Processing progress */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            处理进度
          </span>
          <span className="text-sm font-semibold text-primary tabular-nums">
            {stats.saw} / {simulationSize}
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
          {(stats.stances ?? stanceCounts.map((s) => s.stance)).map((stance, i) => (
            <StanceBar
              key={stance}
              label={stance}
              pct={pct(getCount(stance))}
              colorIndex={i}
            />
          ))}
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

const STANCE_COLORS = [
  { bar: "bg-primary", text: "text-primary" },
  { bar: "bg-secondary", text: "text-secondary" },
  { bar: "bg-amber-500", text: "text-amber-600" },
  { bar: "bg-muted-foreground/40", text: "text-muted-foreground" },
];

function StanceBar({ label, pct, colorIndex }: { label: string; pct: number; colorIndex: number }) {
  const { bar, text } = STANCE_COLORS[colorIndex % STANCE_COLORS.length];
  return (
    <div>
      <div className="flex justify-between text-[10px] font-semibold mb-1">
        <span className="text-muted-foreground tracking-wider">{label}</span>
        <span className={text}>{pct}%</span>
      </div>
      <div className="h-0.75 w-full bg-[#eae8e7] rounded-full overflow-hidden">
        <div className={`h-full ${bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
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
