"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/Sidebar"
import { useUser, SignInButton } from "@clerk/nextjs"
import { ArrowUpIcon } from "lucide-react"
import { Logo } from "@/components/Logo"

export default function NewPage() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [limitError, setLimitError] = useState(false)
  const createQuestion = useMutation(api.questions.create)
  const usage = useQuery(api.questions.dailyUsage)
  const router = useRouter()
  const { isSignedIn } = useUser()

  const remaining = usage ? usage.limit - usage.used : null
  const isExhausted = remaining !== null && remaining <= 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setLimitError(false)
    try {
      const id = await createQuestion({ text: text.trim() })
      router.push(`/q/${id}`)
    } catch (err: any) {
      if (err?.message?.includes("DAILY_LIMIT_EXCEEDED")) {
        setLimitError(true)
      } else {
        console.error(err)
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex flex-col items-center gap-3 text-foreground">
            <Logo size={48} variant="mark" />
            <span className="font-serif text-lg font-semibold">提出一个问题</span>
          </div>
          {!isSignedIn ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">登录后才能发布问题</p>
              <SignInButton mode="modal">
                <Button>登录 / 注册</Button>
              </SignInButton>
            </div>
          ) : isExhausted ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border py-10 text-center">
              <p className="text-sm text-foreground font-medium">今天的提问次数已用完</p>
              <p className="text-xs text-muted-foreground">每天最多提 {usage?.limit} 个问题，明天再来吧</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="relative rounded-2xl border border-border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
                <textarea
                  className="min-h-32 w-full resize-none rounded-2xl bg-transparent px-4 pt-4 pb-14 text-sm focus:outline-none"
                  placeholder="描述你的处境或问题，虚拟网民会来回应..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={loading}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {remaining !== null && (
                    <span className="text-xs text-muted-foreground">今日还剩 {remaining} 次</span>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30 hover:opacity-80"
                  >
                    <ArrowUpIcon className="size-4" />
                  </button>
                </div>
              </div>
              {limitError && (
                <p className="mt-2 text-xs text-destructive">今天的提问次数已用完，明天再来吧</p>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
