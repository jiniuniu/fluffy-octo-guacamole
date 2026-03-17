"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { GlobeIcon, LockIcon } from "lucide-react"

export function Dashboard({ questionId }: { questionId: Id<"questions"> }) {
  const stats = useQuery(api.questions.stats, { id: questionId })
  const question = useQuery(api.questions.getById, { id: questionId })
  const personas = useQuery(api.personas.list)
  const setPublic = useMutation(api.questions.setPublic)

  if (!stats) return null

  const total = stats.support + stats.oppose + stats.neutral
  const pct = (n: number) => total === 0 ? 0 : Math.round((n / total) * 100)

  const isProcessing = question?.status === "processing"
  const totalPersonas = personas?.length ?? 0
  const progressPct = totalPersonas === 0 ? 0 : Math.min(100, Math.round((stats.saw / totalPersonas) * 100))

  const isPublic = question?.is_public ?? false

  return (
    <div className="px-4 py-3 space-y-3">
      {/* public toggle */}
      <button
        onClick={() => setPublic({ id: questionId, is_public: !isPublic })}
        className="flex w-full items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs transition-colors hover:bg-muted"
      >
        {isPublic ? (
          <GlobeIcon className="size-3.5 text-green-500" />
        ) : (
          <LockIcon className="size-3.5 text-muted-foreground" />
        )}
        <span className={isPublic ? "text-green-600 font-medium" : "text-muted-foreground"}>
          {isPublic ? "已公开 · 在广场可见" : "私密 · 仅自己可见"}
        </span>
        {isPublic && question?.slug && (
          <span className="ml-auto font-mono text-muted-foreground/60">{question.slug}</span>
        )}
      </button>

      {/* progress bar when processing */}
      {isProcessing && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="animate-pulse">处理中...</span>
            <span>{stats.saw} / {totalPersonas}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* stance bars */}
      <div className="flex gap-3">
        <StanceItem label="支持" count={stats.support} pct={pct(stats.support)} color="bg-green-500" />
        <StanceItem label="反对" count={stats.oppose}  pct={pct(stats.oppose)}  color="bg-red-500" />
        <StanceItem label="中立" count={stats.neutral} pct={pct(stats.neutral)} color="bg-zinc-400" />
      </div>

      {/* behavior breakdown */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 border-t border-border pt-2.5">
        <StatCell label="看到" value={stats.saw} />
        <StatCell label="路过" value={stats.ignored} />
        <StatCell label="点赞问题" value={stats.likedQ} />
        <StatCell label="回答" value={stats.answered} />
        <StatCell label="点赞回答" value={stats.likedAnswer} />
        <StatCell label="回复评论" value={stats.replied} />
      </div>
    </div>
  )
}

function StanceItem({ label, count, pct, color }: {
  label: string; count: number; pct: number; color: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{count}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
