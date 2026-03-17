"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/Sidebar"
import { useUser, SignInButton } from "@clerk/nextjs"
import { ArrowUpIcon } from "lucide-react"

export default function NewPage() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const createQuestion = useMutation(api.questions.create)
  const router = useRouter()
  const { isSignedIn } = useUser()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      const id = await createQuestion({ text: text.trim() })
      router.push(`/q/${id}`)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <h1 className="mb-6 text-xl font-semibold">提出一个问题</h1>
          {!isSignedIn ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">登录后才能发布问题</p>
              <SignInButton mode="modal">
                <Button>登录 / 注册</Button>
              </SignInButton>
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
                <div className="absolute bottom-3 right-3">
                  <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30 hover:opacity-80"
                  >
                    <ArrowUpIcon className="size-4" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
