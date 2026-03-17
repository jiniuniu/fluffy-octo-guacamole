# 虚拟社区系统设计文档

## 概念

用户像在知乎发问题，20个基于真实调研数据的虚拟人（各有价值观画像）会模拟真实网民行为——点赞、回答、互动。系统用规则引擎计算每个虚拟人的行为概率，用 LLM 生成具体内容。

---

## 技术栈

| 层 | 选择 |
|----|------|
| 前端 | Next.js (App Router) |
| 后端 / DB / 实时 | Convex |
| LLM 调用 | LangChain JS (`@langchain/anthropic`) in Convex actions |
| 输出解析 | Zod schema + LangChain structured output |
| 实时推送 | Convex reactive query（action 每完成一步写库，前端自动收到） |

**核心理由**：Convex action 原生支持 async + 外部 API 调用，reactive query 自动推送数据库变更到前端，不需要手写 SSE，历史 sidebar 只是一个 `useQuery`。不引入 streaming 组件——每个 action 写完整结果入库即可，回答文本不逐 token 流式展示。

---

## 数据模型（Convex Schema）

### `personas` 表

虚拟人，从 `survey_data_analysis` 数据一次性导入，只读。

```ts
personas: defineTable({
  cluster: v.number(),                  // 0-5
  cluster_label: v.string(),            // "传统全能派"
  demo: v.object({
    age: v.number(),
    gender: v.string(),
    city: v.string(),
    education: v.string(),
    occupation: v.string(),
  }),
  bio: v.string(),                      // 150-200字人物描述，不含姓名
  vector: v.object({                    // 20维group-level偏差值
    SEQ01: v.number(), SEQ02: v.number(), SEQ03: v.number(), SEQ05: v.number(),
    OTQ01: v.number(), OTQ02: v.number(), OTQ03: v.number(), OTQ04: v.number(),
    OTQ05: v.number(), OTQ06: v.number(), OTQ07: v.number(), OTQ08: v.number(),
    OTQ10: v.number(), GRQ01: v.number(), GRQ02: v.number(), GRQ07: v.number(),
    GRQ08: v.number(), GRQ09: v.number(), MAQ01: v.number(), MAQ02: v.number(),
  }),
})
```

### `questions` 表

用户发布的问题，每条对应一个完整的模拟 session。

```ts
questions: defineTable({
  text: v.string(),
  author: v.string(),                   // "user" 或未来支持真人账号
  status: v.union(
    v.literal("pending"),               // 刚创建，等待处理
    v.literal("processing"),            // 虚拟人正在行动
    v.literal("done"),                  // 全部完成
  ),
  topic_vector: v.optional(v.object({   // LLM提取后填入，同personas.vector结构
    SEQ01: v.optional(v.number()), SEQ02: v.optional(v.number()),
    // ... 其余维度同上，全部 optional（不相关的维度不填）
  })),
  created_at: v.number(),
})
```

### `answers` 表

虚拟人对问题的回答。

```ts
answers: defineTable({
  question_id: v.id("questions"),
  persona_id: v.id("personas"),
  text: v.string(),
  stance: v.union(v.literal("support"), v.literal("neutral"), v.literal("oppose")),
  like_count: v.number(),
  liked_by: v.array(v.id("personas")),  // 点赞的虚拟人ID列表
  created_at: v.number(),
})
.index("by_question", ["question_id"])
.index("by_question_likes", ["question_id", "like_count"])
```

### `replies` 表

虚拟人对回答的回复。

```ts
replies: defineTable({
  answer_id: v.id("answers"),
  persona_id: v.id("personas"),
  text: v.string(),
  like_count: v.number(),
  created_at: v.number(),
})
.index("by_answer", ["answer_id"])
```

### `activity_log` 表

每个虚拟人的每个动作都记录，驱动日志面板。

```ts
activity_log: defineTable({
  question_id: v.id("questions"),
  persona_id: v.id("personas"),
  action: v.union(
    v.literal("ignore"),
    v.literal("like_question"),
    v.literal("answer"),
    v.literal("like_answer"),
    v.literal("reply_answer"),
  ),
  target_id: v.optional(v.string()),    // answer_id 或 reply_id
  score: v.number(),                    // 匹配度分数，供debug
  created_at: v.number(),
})
.index("by_question", ["question_id"])
```

---

## 数据流转

### 整体流程

```
用户输入问题
    │
    ▼
mutation: createQuestion()        → 写入 questions 表（status: pending）
    │                               前端 sidebar 立即更新
    ▼
action: processQuestion()         → 在 Convex action 中运行
    │
    ├─ Step 1: LLM提取 topic_vector
    │          mutation: updateTopicVector()
    │
    └─ Step 2: 遍历所有 personas（串行）
               for each persona:
                 计算 score(persona.vector, topic_vector)
                 读取当前已有answers（按like_count排序，最多10条）

                 可选动作空间（随上下文动态变化）：
                   - 无已有回答时：ignore / like_question / answer
                   - 有已有回答时：以上 + like_answer / reply_answer

                 采样 action
                 if action == "answer":   LLM生成回答 → mutation: createAnswer()
                 if action == "reply_answer":  LLM生成回复 → mutation: createReply()
                 if action == "like_answer":   mutation: addLike(answer_id)
                 mutation: createActivityLog()    ← 每步写库，前端实时看到
    │
    ▼
mutation: updateQuestionStatus("done")
```

### 前端响应

Convex reactive query 自动订阅，无需轮询：

```ts
// 问题列表（sidebar历史）
const questions = useQuery(api.questions.list)

// 当前问题的回答（实时更新）
const answers = useQuery(api.answers.byQuestion, { question_id })

// 活动日志（实时append）
const logs = useQuery(api.activity_log.byQuestion, { question_id })

// Dashboard统计（实时派生）
const stats = useQuery(api.questions.stats, { question_id })
```

---

## 规则引擎

### 匹配度分数

```ts
function score(personaVector: Record<string, number>, topicVector: Record<string, number>): number {
  let dot = 0
  for (const dim of Object.keys(topicVector)) {
    dot += (personaVector[dim] ?? 0) * topicVector[dim]
  }
  return dot  // 无需normalize，维度权重已在topic_vector中体现
}
```

- `personaVector` 值域：约 ±2（group-level标准化偏差）
- `topicVector` 值域：0~1（问题对该维度的相关度）
- score 越大：强烈认同；越小（负值）：强烈反对；接近0：无感

### 动作采样

```ts
type Action = "ignore" | "like_question" | "answer"

function sampleAction(score: number): Action {
  // base probs
  let p = { ignore: 0.60, like_question: 0.25, answer: 0.15 }

  // 强烈认同或强烈反对都更愿意发声
  const absScore = Math.abs(score)
  if (absScore > 1.5) {
    p.answer += 0.25; p.ignore -= 0.25
  } else if (absScore > 0.8) {
    p.answer += 0.10; p.ignore -= 0.10
  }

  // 采样
  return weightedSample(p)
}
```

当有已有回答时，动作空间扩展，采样逻辑：

```ts
type Action = "ignore" | "like_question" | "answer" | "like_answer" | "reply_answer"

function sampleAction(score: number, existingAnswers: Answer[]): Action {
  let p = { ignore: 0.55, like_question: 0.20, answer: 0.15, like_answer: 0.00, reply_answer: 0.00 }

  // 有已有回答时，分配给互动动作的概率
  if (existingAnswers.length > 0) {
    p.like_answer = 0.07
    p.reply_answer = 0.03
    p.ignore -= 0.10
  }

  // 强烈认同或强烈反对，更愿意发声
  const absScore = Math.abs(score)
  if (absScore > 1.5) {
    p.answer += 0.20; p.reply_answer += 0.05; p.ignore -= 0.25
  } else if (absScore > 0.8) {
    p.answer += 0.10; p.ignore -= 0.10
  }

  return weightedSample(p)
}
```

如果采样结果是 `like_answer` 或 `reply_answer`，再从已有回答中选一条目标（按 `like_count` 加权采样，高赞回答更容易被互动）。

---

## LangChain + Zod 调用模式

所有 LLM 调用在 Convex action 中，用 `"use node"` 指令。

### Call 1：提取 topic_vector

```ts
// convex/chains/topicVectorChain.ts
import { ChatAnthropic } from "@langchain/anthropic"
import { z } from "zod"

const TopicVectorSchema = z.object({
  SEQ01: z.number().min(0).max(1).optional(),
  OTQ05: z.number().min(0).max(1).optional(),
  OTQ06: z.number().min(0).max(1).optional(),
  // ... 20个维度，全部optional
}).describe("问题在各价值观维度上的相关度，0=无关，1=高度相关")

export async function extractTopicVector(questionText: string) {
  const llm = new ChatAnthropic({ model: "claude-sonnet-4-6", temperature: 0 })
  const structured = llm.withStructuredOutput(TopicVectorSchema)
  return await structured.invoke([
    { role: "system", content: TOPIC_VECTOR_SYSTEM_PROMPT },
    { role: "user", content: questionText },
  ])
}
```

### Call 2：生成回答

```ts
// convex/chains/answerChain.ts
const AnswerSchema = z.object({
  text: z.string().describe("回答正文，符合人物语气，100-300字"),
  stance: z.enum(["support", "neutral", "oppose"]).describe("对问题中主角的立场"),
})

export async function generateAnswer(persona: Persona, question: string, existingAnswers: string[]) {
  const llm = new ChatAnthropic({ model: "claude-sonnet-4-6", temperature: 0.9 })
  const structured = llm.withStructuredOutput(AnswerSchema)
  return await structured.invoke([
    { role: "system", content: buildPersonaSystemPrompt(persona) },
    { role: "user", content: buildAnswerUserPrompt(question, existingAnswers) },
  ])
}
```

### Call 3：生成回复

```ts
// convex/chains/replyChain.ts
const ReplySchema = z.object({
  text: z.string().describe("回复内容，口语化，50字以内"),
})
```

---

## UI 布局（ASCII）

```
┌─────────┬───────────────────────────────────────┬─────────────────┐
│         │                                       │                 │
│ Sidebar │   问题 & 回答区                        │   实时日志      │
│         │   ─────────────────────────           │   ──────────    │
│ [历史1] │   [问题文本]                           │ 王芳 → 忽略     │
│ [历史2] │                                       │ 李建国 → 点赞   │
│ [历史3] │   ── 回答（按点赞排序）──               │ 张敏 → 回答     │
│         │                                       │ 陈浩 → 回复张敏 │
│ [新问题]│   👍23  张敏                           │ ...             │
│         │   "我觉得..."                          │                 │
│         │   └─ 陈浩: "楼上..."                  ├─────────────────┤
│         │                                       │                 │
│         │   👍11  李建国                         │   Dashboard     │
│         │   "其实吧..."                          │   ──────────    │
│         │                                       │ 支持  ████ 13   │
│         │   👍3   赵静                           │ 反对  ██   5    │
│         │   "你妈也是..."                        │ 中立  █    2    │
│         │                                       │                 │
│         │   [你的回复输入框]  [发布]              │ 活跃集群:       │
│         │                                       │ C2传统派 7条    │
├─────────┴───────────────────────────────────────┴─────────────────┤
│  提问: [_________________________________________]  [发布]          │
└────────────────────────────────────────────────────────────────────┘
```

---

## 项目结构

```
virtual_community/
├── DESIGN.md
│
├── convex/                           # Convex 后端
│   ├── schema.ts                     # 所有表定义
│   ├── personas.ts                   # query: list, getById
│   ├── questions.ts                  # mutation: create, update; query: list, stats
│   ├── answers.ts                    # mutation: create, addLike; query: byQuestion
│   ├── replies.ts                    # mutation: create; query: byAnswer
│   ├── activity_log.ts               # mutation: create; query: byQuestion
│   ├── simulation.ts                 # action: processQuestion（主流程）
│   └── chains/
│       ├── client.ts                 # get_llm()，统一配置
│       ├── topicVectorChain.ts       # Call 1: 提取topic_vector
│       ├── answerChain.ts            # Call 2: 生成回答
│       └── replyChain.ts             # Call 3: 生成回复
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # ConvexProvider包裹
│   ├── page.tsx                      # 重定向或默认页
│   └── q/
│       └── [id]/
│           └── page.tsx              # 问题详情页（主界面）
│
├── components/
│   ├── Sidebar.tsx                   # 历史问题列表
│   ├── QuestionPanel.tsx             # 问题+回答区
│   ├── ActivityLog.tsx               # 实时日志
│   ├── Dashboard.tsx                 # 统计面板
│   └── QuestionInput.tsx             # 底部输入框
│
├── scripts/
│   └── import_personas.ts            # 一次性导入：读JSON → convex mutation
│
├── data/
│   └── personas.json                 # 从survey_data_analysis生成的20个虚拟人
│
├── lib/
│   └── engine.ts                     # 规则引擎（score计算、动作采样，纯函数）
│
├── package.json
└── .env.local                        # ANTHROPIC_API_KEY, CONVEX_URL
```

---

## 虚拟人导入流程

1. 用 Python 脚本从 `output_cluster_profiles.json` + `output_labeled.csv` 生成 `data/personas.json`（20条）
2. 运行 `npx ts-node scripts/import_personas.ts` 批量写入 Convex `personas` 表
3. 后续应用直接 `useQuery(api.personas.list)` 读取，不再改动

---

## 关键设计决策

**为什么 action 内部直接循环而不是每个 persona 一个 action？**
简单，避免 action 间协调。20个 persona 串行处理约 20-40 秒，在 Convex 10分钟超时内完全够用。每完成一个动作立即 mutation 写库，前端实时看到进度。

**Zod vs PydanticOutputParser**
Zod + `withStructuredOutput` 等价于 Python 的 `PydanticOutputParser` + `OutputFixingParser`，LangChain JS 底层自动处理重试和修复。

**topic_vector 维度全 optional**
问题不会涉及全部20个价值观维度，LLM只填相关的，score计算时缺失维度默认0，不影响结果。
