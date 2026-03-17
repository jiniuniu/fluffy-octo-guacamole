"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { ThumbsUpIcon, SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PersonaCard } from "@/components/PersonaCard"

const STANCE_BORDER: Record<string, string> = {
  support: "border-l-2 border-green-400",
  oppose:  "border-l-2 border-red-400",
  neutral: "border-l-2 border-zinc-300",
}

const STANCE_LABEL: Record<string, string> = {
  support: "支持",
  oppose:  "反对",
  neutral: "中立",
}

export function AnswerList({ questionId }: { questionId: Id<"questions"> }) {
  const answers = useQuery(api.answers.byQuestion, { question_id: questionId })
  const personas = useQuery(api.personas.list)
  const personaMap = new Map(personas?.map((p) => [p._id, p]))

  // top 9 by likes + 1 random exploration slot (stable across re-renders)
  // must be before early returns to respect Rules of Hooks
  const feed = useMemo(() => {
    if (!answers || answers.length === 0) return []
    const top9 = answers.slice(0, 9)
    const rest = answers.slice(9)
    const explorer = rest.length > 0 ? rest[Math.floor(Math.random() * rest.length)] : null
    return explorer ? [...top9, { ...explorer, _isExplorer: true }] : top9
  }, [answers?.length])

  if (!answers) return <p className="text-sm text-muted-foreground p-4">加载中...</p>
  if (answers.length === 0) return <p className="text-sm text-muted-foreground p-4">虚拟网民正在思考中...</p>

  return (
    <div className="divide-y divide-border">
      {feed.map((answer) => {
        const isExplorer = "_isExplorer" in answer && answer._isExplorer
        const persona = personaMap.get(answer.persona_id)
        return (
          <div key={answer._id} className={`px-4 py-3 ${STANCE_BORDER[answer.stance]}`}>
            {/* explorer badge */}
            {isExplorer && (
              <div className="mb-1 text-xs text-muted-foreground/60">· 随机探索</div>
            )}

            {/* author line */}
            <div className="mb-1.5 flex items-center gap-1.5">
              {persona ? (
                <PersonaCard persona={persona}>
                  <span className="cursor-default text-xs font-semibold text-foreground hover:underline">
                    {persona.demo.city} · {persona.demo.occupation}
                  </span>
                </PersonaCard>
              ) : (
                <span className="text-xs font-semibold text-foreground">匿名</span>
              )}
              <span className="text-xs text-muted-foreground">
                {persona?.demo.age}岁
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{STANCE_LABEL[answer.stance]}</span>
            </div>

            {/* answer body */}
            <p className="text-sm leading-relaxed text-foreground">{answer.text}</p>

            {/* like count + reply input inline */}
            <div className="mt-1.5 flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ThumbsUpIcon className="size-3" />
                {answer.like_count}
              </span>
              <ReplyInput answerId={answer._id} inline />
            </div>

            {/* replies tree */}
            <div className="mt-1.5 ml-3 border-l-2 border-border pl-3 space-y-2">
              {answer.replies.map((reply) => {
                const isUser = reply.author === "user"
                const rPersona = reply.persona_id != null ? personaMap.get(reply.persona_id) : null
                return (
                  <div key={reply._id}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {isUser ? (
                        <span className="text-xs font-semibold text-blue-600">你</span>
                      ) : rPersona ? (
                        <PersonaCard persona={rPersona}>
                          <span className="cursor-default text-xs font-semibold text-foreground hover:underline">
                            {rPersona.demo.city} · {rPersona.demo.occupation}
                          </span>
                        </PersonaCard>
                      ) : (
                        <span className="text-xs font-semibold text-foreground">匿名</span>
                      )}
                      {!isUser && rPersona && (
                        <span className="text-xs text-muted-foreground">{rPersona.demo.age}岁</span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-foreground">{reply.text}</p>
                  </div>
                )
              })}

            </div>
          </div>
        )
      })}
    </div>
  )
}

function ReplyInput({ answerId }: { answerId: Id<"answers">; inline?: boolean }) {
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const createUserReply = useMutation(api.replies.createUserReply)
  const replyToUser = useAction(api.simulation.replyToUser)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    const submitted = text.trim()
    try {
      await createUserReply({ answer_id: answerId, text: submitted })
      setText("")
      setOpen(false)
      replyToUser({ answer_id: answerId, user_reply_text: submitted }).catch(console.error)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        + 回复
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-1.5">
      <input
        autoFocus
        className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="说点什么..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <Button size="icon-xs" type="submit" disabled={loading || !text.trim()}>
        <SendIcon />
      </Button>
      <Button size="icon-xs" variant="ghost" type="button" onClick={() => setOpen(false)}>
        ✕
      </Button>
    </form>
  )
}
