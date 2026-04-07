"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { MessageSquareIcon, UsersIcon } from "lucide-react"
import { StanceDistribution } from "@/components/StanceDistribution"
import { useUser } from "@clerk/nextjs"
import { NetworkHero } from "@/components/NetworkHero"
import { TopNav } from "@/components/TopNav"

export default function Home() {
  const questions = useQuery(api.questions.listPublic)
  const router = useRouter()
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <NetworkHero isSignedIn={!!isSignedIn} />

      {/* feed */}
      <main className="mx-auto max-w-5xl px-4 sm:px-12 py-6 sm:py-10">
        {/* section label */}
        <div className="mb-6">
          <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            广场 · 公开讨论
          </span>
        </div>

        {questions === undefined && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded bg-[#f6f3f2]" />
            ))}
          </div>
        )}

        {questions?.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">还没有公开的问题</p>
            <p className="mt-1 text-xs text-muted-foreground/50">发布问题后在详情页将其设为公开即可出现在这里</p>
          </div>
        )}

        {questions && questions.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {questions.map((q) => (
              <FeedCard key={q._id} question={q} onClick={() => router.push(`/s/${q.slug}`)} />
            ))}
          </div>
        )}
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
    title?: string
    description?: string
    status: string
    slug?: string
  }
  onClick: () => void
}) {
  const stats = useQuery(api.questions.stats, { id: question._id as any })

  const stanceCounts = stats?.stanceCounts ?? []
  const total = stanceCounts.reduce((s, e) => s + e.count, 0)

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-[#f6f3f2] hover:bg-[#eae8e7] rounded px-5 py-4 transition-colors"
    >
      {/* title */}
      <p className="text-sm font-semibold leading-relaxed text-foreground line-clamp-2 mb-1.5">
        {question.title ?? question.text}
      </p>

      {/* description */}
      {question.description && (
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {question.description}
        </p>
      )}

      {/* stance distribution */}
      {total > 0 && (
        <div className="mb-3">
          <StanceDistribution
            stances={stats?.stances}
            stanceCounts={stanceCounts}
            variant="bar"
          />
        </div>
      )}

      {/* meta */}
      <div className="flex items-center gap-3 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquareIcon className="size-2.5" />
          {stats?.answered ?? 0} 条回答
        </span>
        {(stats?.saw ?? 0) > 0 && (
          <span className="flex items-center gap-1">
            <UsersIcon className="size-2.5" />
            {stats!.saw} 人
          </span>
        )}
        {question.status === "processing" && (
          <span className="ml-auto animate-pulse text-primary">进行中</span>
        )}
      </div>
    </button>
  )
}
