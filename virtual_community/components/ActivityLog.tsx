"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { PersonaCard } from "@/components/PersonaCard"
import { useEffect, useRef } from "react"

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  answer:       { label: "发表了回答", color: "text-blue-600" },
  reply_answer: { label: "回复了回答", color: "text-purple-600" },
  like_answer:  { label: "点赞了回答", color: "text-pink-500" },
  like_question:{ label: "点赞了问题", color: "text-orange-500" },
  ignore:       { label: "路过",       color: "text-muted-foreground" },
}

export function ActivityLog({ questionId }: { questionId: Id<"questions"> }) {
  const logs = useQuery(api.activity_log.byQuestion, { question_id: questionId })
  const personas = useQuery(api.personas.list)
  const bottomRef = useRef<HTMLDivElement>(null)

  const personaMap = new Map(personas?.map((p) => [p._id, p]))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs?.length])

  return (
    <div className="flex h-full flex-col">
      <h2 className="shrink-0 border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        实时动态
      </h2>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {!logs && (
          <p className="text-xs text-muted-foreground">等待中...</p>
        )}
        {logs?.map((log) => {
          const persona = personaMap.get(log.persona_id)
          const meta = ACTION_LABEL[log.action] ?? { label: log.action, color: "" }
          return (
            <div key={log._id} className="flex items-start gap-1.5 text-xs">
              {persona ? (
                <PersonaCard persona={persona}>
                  <span className="shrink-0 cursor-default rounded bg-muted px-1 py-0.5 font-medium text-foreground hover:bg-muted/70">
                    {persona.demo.city} · {persona.demo.occupation}
                  </span>
                </PersonaCard>
              ) : (
                <span className="shrink-0 rounded bg-muted px-1 py-0.5 font-medium text-foreground">...</span>
              )}
              <span className={cn("mt-0.5", meta.color)}>{meta.label}</span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
