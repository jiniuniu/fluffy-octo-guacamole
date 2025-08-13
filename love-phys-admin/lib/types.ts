import { EditorHistory } from "./editor/types";

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
  // 新增音频相关字段
  audio_url?: string;
  audio_metadata?: {
    voice_type: string;
    text_length: number;
    file_size: number;
    mime_type: string;
    generated_at: string;
  };
  svg_type?: string;
  editHistory?: EditorHistory;
  lastEditedAt?: string;
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
  // 新增TTS相关字段
  enable_tts?: boolean;
  voice_type?:
    | "Chelsie"
    | "Cherry"
    | "Ethan"
    | "Serena"
    | "Dylan"
    | "Jada"
    | "Sunny";
  svg_type?: "dynamic" | "static";
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
