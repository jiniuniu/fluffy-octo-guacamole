// lib/api.ts
import {
  GenerateRequest,
  ModifyRequest,
  PaginationParams,
  GenerationRecord,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(
      response.status,
      errorData.detail || errorData.message || "Request failed"
    );
  }

  return response.json();
}

// 生成相关API - 只保留使用的接口
export const generationApi = {
  // 生成完整内容
  async generateFull(data: GenerateRequest) {
    return apiRequest<{
      id: string;
      question: string;
      model: string;
      content: { explanation: string };
      animation: { svgCode: string };
      created_at: string;
    }>("/generate/full", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 修改SVG动画
  async modifySvg(data: ModifyRequest) {
    return apiRequest<{
      message: string;
      svg_code: string;
      timestamp: string;
    }>(`/history/${data.history_id}/modify`, {
      method: "POST",
      body: JSON.stringify({
        feedback: data.feedback,
        model: data.model,
      }),
    });
  },
};

// 历史记录API
export const historyApi = {
  // 获取历史记录列表
  async getHistory(params?: PaginationParams) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiRequest<{
      items: Array<{
        id: string;
        question: string;
        explanation: string;
        svg_code: string;
        model: string;
        status: string;
        created_at: string;
        error_message?: string;
      }>;
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    }>(`/history?${searchParams}`);
  },

  // 根据ID获取历史记录
  async getById(id: string) {
    return apiRequest<GenerationRecord>(`/history/${id}`);
  },

  // 删除历史记录
  async deleteById(id: string) {
    return apiRequest(`/history/${id}`, {
      method: "DELETE",
    });
  },

  // 导出SVG
  async exportSvg(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export/history/${id}/svg`);
    if (!response.ok) {
      throw new ApiError(response.status, "Export failed");
    }
    return response.blob();
  },

  // 导出JSON
  async exportJson(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export/history/${id}/json`);
    if (!response.ok) {
      throw new ApiError(response.status, "Export failed");
    }
    return response.blob();
  },
};
