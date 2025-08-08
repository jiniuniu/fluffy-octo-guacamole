// lib/types.ts
export interface GenerationRecord {
  id: string;
  question: string;
  explanation: string;
  svg_code: string;
  model: "claude" | "qwen";
  status: "pending" | "success" | "failed";
  created_at: string;
  error_message?: string;
}

// 统一的异步操作状态
export interface AsyncOperation {
  isLoading: boolean;
  type: "generating" | "modifying" | "loading" | null;
  progress: number;
  currentStep: string;
}

// API 请求类型
export interface GenerateRequest {
  question: string;
  model: "claude" | "qwen";
}

export interface ModifyRequest {
  history_id: string;
  feedback: string;
  model: "claude" | "qwen";
}

// 分页参数
export interface PaginationParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  model?: string;
  status?: string;
}
