"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { useUser, SignInButton } from "@clerk/nextjs"
import { ArrowUpIcon, MenuIcon } from "lucide-react"

// 今日话题：围绕价值观核心维度，每个话题都能引发支持与反对
const TRENDING = [
  // 性别观
  "全职太太是一种选择还是一种退步？",
  "男性在育儿中应该承担和女性同等的责任吗？",
  // 婚姻观
  "不婚不育是对社会的逃避还是一种正当选择？",
  "闪婚比长期恋爱更容易离婚吗？",
  // 生育观
  "生孩子是为了自己还是为了社会？",
  "三孩政策能真正解决人口问题吗？",
  // 孝道
  "把父母送进养老院是不孝吗？",
  "父母有没有权利干涉子女的婚恋选择？",
  // 国家认同
  "爱国主义和批评政府可以并存吗？",
  "年轻人移民是背叛还是个人自由？",
  // 传统文化
  "春节回家过年应该是义务还是选择？",
  "中医是科学还是玄学？",
  // 财富观
  "普通人努力奋斗还能改变命运吗？",
  "富人的钱都是靠不正当手段赚来的吗？",
  // 权力观
  "服从权威是美德还是懦弱？",
  "网络举报是正义还是道德绑架？",
  // 社会看法
  "躺平是合理的人生选择还是社会的失败？",
  "内卷是个人问题还是制度问题？",
  // LGBT
  "同性恋是否应该被允许合法结婚？",
  "学校应该开展性别多元教育吗？",
  // 工作与集体
  "996是企业剥削还是奋斗精神？",
  "集体利益和个人利益冲突时应该怎么选？",
]

export default function NewPage() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [limitError, setLimitError] = useState(false)
  const createQuestion = useMutation(api.questions.create)
  const usage = useQuery(api.questions.dailyUsage)
  const router = useRouter()
  const { isSignedIn } = useUser()

  const remaining = usage ? (usage.isAdmin ? null : usage.limit - usage.used) : null
  const isExhausted = !usage?.isAdmin && remaining !== null && remaining <= 0

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tickerIndex, setTickerIndex] = useState(0)
  const [tickerVisible, setTickerVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerVisible(false)
      setTimeout(() => {
        setTickerIndex((i) => (i + 1) % TRENDING.length)
        setTickerVisible(true)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

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
    <div className="flex h-screen bg-background">
      {/* Sidebar: hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center px-4 h-14 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <MenuIcon className="size-5" />
        </button>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center md:ml-64 px-4 sm:px-12 pt-14 md:pt-0">
        <div className="w-full max-w-2xl">

          {/* Ticker */}
          <div className="mb-10">
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3">
              今日话题
            </p>
            <button
              type="button"
              onClick={() => setText(TRENDING[tickerIndex])}
              className="text-left group"
            >
              <p
                className={`text-2xl font-bold tracking-tight text-foreground leading-snug transition-opacity duration-300 group-hover:text-primary ${tickerVisible ? "opacity-100" : "opacity-0"}`}
              >
                {TRENDING[tickerIndex]}
              </p>
              <p className={`mt-1.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/40 transition-opacity duration-300 ${tickerVisible ? "opacity-100" : "opacity-0"}`}>
                点击填入 ↗
              </p>
            </button>
          </div>

          {/* Not signed in */}
          {!isSignedIn ? (
            <div className="bg-[#f6f3f2] rounded px-8 py-12 text-center">
              <p className="text-sm text-foreground font-medium mb-1">需要登录才能发布问题</p>
              <p className="text-xs text-muted-foreground mb-6">登录后每天可提问 3 次</p>
              <SignInButton mode="modal">
                <button className="bg-primary text-white text-xs font-semibold tracking-widest uppercase px-6 py-2.5 rounded hover:bg-primary/90 transition-colors">
                  登录 / 注册
                </button>
              </SignInButton>
            </div>

          ) : isExhausted ? (
            <div className="bg-[#f6f3f2] rounded px-8 py-12 text-center">
              <p className="text-sm text-foreground font-medium mb-1">今日提问次数已用完</p>
              <p className="text-xs text-muted-foreground">每天最多提 {usage?.limit} 个问题，明天再来吧</p>
            </div>

          ) : (
            <form onSubmit={handleSubmit}>
              {/* Textarea card */}
              <div className="relative bg-[#f6f3f2] rounded overflow-hidden focus-within:ring-1 focus-within:ring-primary/40 transition-all">
                <textarea
                  autoFocus
                  className="w-full min-h-40 resize-none bg-transparent px-6 pt-6 pb-16 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  placeholder="描述你的处境或问题，虚拟网民会来回应..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e as any)
                  }}
                />

                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-t border-black/5">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
                    {remaining !== null
                      ? `今日剩余 ${remaining} 次`
                      : "无限制"}
                  </span>
                  <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="flex items-center gap-2 bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded disabled:opacity-30 hover:bg-primary/90 transition-all active:scale-95"
                  >
                    {loading ? (
                      <span className="animate-pulse">发布中...</span>
                    ) : (
                      <>
                        发布
                        <ArrowUpIcon className="size-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {limitError && (
                <p className="mt-3 text-xs text-destructive">今天的提问次数已用完，明天再来吧</p>
              )}

              <p className="mt-3 text-[10px] text-muted-foreground/40">
                ⌘ + Enter 快速发布
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
