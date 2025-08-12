// lib/constants.ts

// 模型配置
export const MODELS = {
  CLAUDE: "claude" as const,
  QWEN: "qwen" as const,
} as const;

export const MODEL_CONFIG = {
  [MODELS.CLAUDE]: {
    name: "Claude",
    displayName: "Claude Sonnet 4",
    description: "推荐使用，质量更高，响应详细",
    icon: "sparkles",
    color: "purple",
  },
  [MODELS.QWEN]: {
    name: "Qwen",
    displayName: "Qwen Coder Plus",
    description: "响应更快，成本较低，适合简单问题",
    icon: "zap",
    color: "blue",
  },
} as const;

// 语音类型配置
export const VOICE_OPTIONS = [
  { id: "Cherry", name: "Cherry", description: "甜美女声" },
  { id: "Chelsie", name: "Chelsie", description: "标准女声" },
  { id: "Serena", name: "Serena", description: "优雅女声" },
  { id: "Ethan", name: "Ethan", description: "标准男声" },
  { id: "Dylan", name: "Dylan", description: "京腔男声" },
  { id: "Jada", name: "Jada", description: "吴语女声" },
  { id: "Sunny", name: "Sunny", description: "川音女声" },
] as const;

// 状态配置
export const STATUS = {
  PENDING: "pending" as const,
  SUCCESS: "success" as const,
  FAILED: "failed" as const,
} as const;

export const STATUS_CONFIG = {
  [STATUS.PENDING]: {
    label: "生成中",
    emoji: "⏳",
    color: "yellow",
  },
  [STATUS.SUCCESS]: {
    label: "成功",
    emoji: "✅",
    color: "green",
  },
  [STATUS.FAILED]: {
    label: "失败",
    emoji: "❌",
    color: "red",
  },
} as const;

// 异步操作类型
export const ASYNC_OPERATION_TYPES = {
  GENERATING: "generating" as const,
  MODIFYING: "modifying" as const,
  LOADING: "loading" as const,
} as const;

// 覆盖层类型
export const OVERLAY_TYPES = {
  EXPLANATION: "explanation" as const,
  TECH_INFO: "tech-info" as const,
} as const;

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_RECENT_RECORDS: 50,
} as const;

// 表单验证
export const VALIDATION = {
  MIN_QUESTION_LENGTH: 5,
  MAX_QUESTION_LENGTH: 500,
  MIN_FEEDBACK_LENGTH: 5,
  MAX_FEEDBACK_LENGTH: 500,
} as const;

// 时间配置（秒）
export const TIMING = {
  GENERATION: {
    WITH_TTS: 60,
    WITHOUT_TTS: 40,
    EXPLANATION_PHASE: 10,
    SVG_PHASE: 30,
    AUDIO_PHASE: 20,
  },
  MODIFICATION: {
    TOTAL: 30,
    ANALYSIS_PHASE: 10,
    MODIFICATION_PHASE: 15,
    OPTIMIZATION_PHASE: 5,
  },
  DEBOUNCE_DELAY: 300,
} as const;

export const SVG_TYPES = {
  DYNAMIC: "dynamic" as const,
  STATIC: "static" as const,
} as const;

export const SVG_TYPE_CONFIG = {
  [SVG_TYPES.DYNAMIC]: {
    name: "动态动画",
    displayName: "动态SVG",
    description: "包含动画效果的交互式SVG",
    icon: "play",
    color: "green",
  },
  [SVG_TYPES.STATIC]: {
    name: "静态图示",
    displayName: "静态SVG",
    description: "静态图解，无动画效果，加载更快",
    icon: "image",
    color: "blue",
  },
} as const;
