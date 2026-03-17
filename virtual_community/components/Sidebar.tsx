"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PlusIcon } from "lucide-react"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"

const STATUS_LABEL: Record<string, string> = {
  pending: "等待中",
  processing: "进行中",
  done: "已完成",
}

export function Sidebar() {
  const questions = useQuery(api.questions.list)
  const router = useRouter()
  const params = useParams()
  const currentId = params?.id as string | undefined
  const { isSignedIn, user } = useUser()

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-border bg-muted/30">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <span className="text-sm font-semibold text-foreground">虚拟社区</span>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => router.push("/new")}
          title="新问题"
        >
          <PlusIcon />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 min-h-0">
        {questions === undefined && (
          <p className="px-3 py-2 text-xs text-muted-foreground">加载中...</p>
        )}
        {questions?.length === 0 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">还没有问题，发一个吧</p>
        )}
        {questions?.map((q) => (
          <button
            key={q._id}
            onClick={() => router.push(`/q/${q._id}`)}
            className={cn(
              "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors",
              currentId === q._id && "bg-muted font-medium"
            )}
          >
            <p className="truncate text-foreground">{q.text}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {STATUS_LABEL[q.status] ?? q.status}
            </p>
          </button>
        ))}
      </nav>
      {/* user area */}
      <div className="shrink-0 border-t border-border px-3 py-2.5">
        {isSignedIn ? (
          <div className="flex items-center gap-2">
            <UserButton />
            <span className="truncate text-xs text-muted-foreground">
              {user.firstName ?? user.emailAddresses[0]?.emailAddress}
            </span>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="w-full rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
              登录 / 注册
            </button>
          </SignInButton>
        )}
      </div>
    </aside>
  )
}
