"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { ThumbsUpIcon, MessageSquareIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"

export default function Home() {
  const questions = useQuery(api.questions.listPublic)
  const router = useRouter()
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-background">
      {/* top nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <span className="font-semibold text-foreground">虚拟社区广场</span>
          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <Button size="sm" onClick={() => router.push("/new")}>
                  <PlusIcon className="mr-1.5 size-3.5" />
                  提问
                </Button>
                <UserButton />
              </>
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" variant="outline">登录 / 注册</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* feed */}
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-3">
        {questions === undefined && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-muted/40" />
            ))}
          </div>
        )}

        {questions?.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">还没有公开的问题</p>
            <p className="mt-1 text-xs text-muted-foreground/60">发布问题后在详情页将其设为公开即可出现在这里</p>
          </div>
        )}

        {questions?.map((q) => (
          <FeedCard key={q._id} question={q} onClick={() => router.push(`/s/${q.slug}`)} />
        ))}
      </main>
    </div>
  )
}

function FeedCard({
  question,
  onClick,
}: {
  question: {
    _id: string
    text: string
    status: string
    slug?: string
    support?: number
    oppose?: number
    neutral?: number
  }
  onClick: () => void
}) {
  const stats = useQuery(api.questions.stats, { id: question._id as any })

  const total = (stats?.support ?? 0) + (stats?.oppose ?? 0) + (stats?.neutral ?? 0)
  const pct = (n: number) => total === 0 ? 0 : Math.round((n / total) * 100)

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-background px-5 py-4 text-left transition-colors hover:bg-muted/40"
    >
      {/* question text */}
      <p className="text-sm font-medium leading-relaxed text-foreground line-clamp-3">{question.text}</p>

      {/* stance bar */}
      {total > 0 && (
        <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${pct(stats!.support)}%` }} />
          <div className="h-full bg-zinc-400 transition-all" style={{ width: `${pct(stats!.neutral)}%` }} />
          <div className="h-full bg-red-500 transition-all" style={{ width: `${pct(stats!.oppose)}%` }} />
        </div>
      )}

      {/* meta row */}
      <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquareIcon className="size-3" />
          {stats?.answered ?? 0} 条回答
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUpIcon className="size-3" />
          {stats?.totalLikes ?? 0} 赞
        </span>
        {question.status === "processing" && (
          <span className="ml-auto animate-pulse text-blue-500">进行中</span>
        )}
      </div>
    </button>
  )
}
