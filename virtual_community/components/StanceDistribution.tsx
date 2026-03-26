"use client";

const COLORS = [
  { bar: "bg-primary", text: "text-primary" },
  { bar: "bg-secondary", text: "text-secondary" },
  { bar: "bg-amber-500", text: "text-amber-600" },
  { bar: "bg-muted-foreground/40", text: "text-muted-foreground" },
];

type StanceEntry = { stance: string; count: number };

interface StanceDistributionProps {
  stances: string[] | null | undefined;
  stanceCounts: StanceEntry[];
  /** "bar" = compact colored bar only (for cards), "full" = bar + labeled rows (for detail pages) */
  variant?: "bar" | "full";
}

export function StanceDistribution({
  stances,
  stanceCounts,
  variant = "bar",
}: StanceDistributionProps) {
  const orderedStances = stances ?? stanceCounts.map((s) => s.stance);
  const total = stanceCounts.reduce((s, e) => s + e.count, 0);
  if (total === 0) return null;

  const getCount = (stance: string) =>
    stanceCounts.find((s) => s.stance === stance)?.count ?? 0;
  const pct = (stance: string) =>
    Math.round((getCount(stance) / total) * 100);

  if (variant === "bar") {
    return (
      <div className="space-y-2">
        {/* Segmented bar */}
        <div className="flex h-1 w-full overflow-hidden rounded-full bg-[#e4e2e2]">
          {orderedStances.map((stance, i) => (
            <div
              key={stance}
              className={`h-full ${COLORS[i % COLORS.length].bar} transition-all`}
              style={{ width: `${pct(stance)}%` }}
            />
          ))}
        </div>
        {/* Labels */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {orderedStances.map((stance, i) => (
            <span
              key={stance}
              className={`text-[10px] font-semibold ${COLORS[i % COLORS.length].text}`}
            >
              {pct(stance)}% {stance}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // full variant — bar + labeled rows with counts
  return (
    <div className="space-y-3">
      {/* Segmented bar */}
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#e4e2e2]">
        {orderedStances.map((stance, i) => (
          <div
            key={stance}
            className={`h-full ${COLORS[i % COLORS.length].bar} transition-all duration-500`}
            style={{ width: `${pct(stance)}%` }}
          />
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-2">
        {orderedStances.map((stance, i) => (
          <div key={stance} className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${COLORS[i % COLORS.length].bar}`} />
            <span className="text-xs text-muted-foreground flex-1">{stance}</span>
            <span className={`text-xs font-semibold tabular-nums ${COLORS[i % COLORS.length].text}`}>
              {pct(stance)}%
            </span>
            <span className="text-[10px] text-muted-foreground/50 tabular-nums w-8 text-right">
              {getCount(stance)}人
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
