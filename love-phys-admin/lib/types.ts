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

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  selectedRecord: GenerationRecord | null;
  recentRecords: GenerationRecord[];
}

export interface GenerateRequest {
  question: string;
  model: "claude" | "qwen";
}
