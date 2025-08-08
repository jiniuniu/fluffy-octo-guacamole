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

// 生成相关API
export const generationApi = {
  // 生成完整内容
  async generateFull(data: { question: string; model: string }) {
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

  // 仅生成内容
  async generateContent(data: { question: string; model: string }) {
    return apiRequest<{ explanation: string }>("/generate/content", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 仅生成动画
  async generateAnimation(data: {
    question: string;
    explanation: string;
    model: string;
  }) {
    return apiRequest<{ svgCode: string }>("/generate/animation", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// 历史记录API
export const historyApi = {
  // 获取历史记录列表
  async getHistory(params?: {
    page?: number;
    page_size?: number;
    keyword?: string;
    model?: string;
    status?: string;
  }) {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata?: any;
      }>;
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    }>(`/history?${searchParams}`);
  },

  // 根据ID获取历史记录
  async getById(id: string) {
    return apiRequest<{
      id: string;
      question: string;
      explanation: string;
      svg_code: string;
      model: string;
      status: string;
      created_at: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata?: any;
    }>(`/history/${id}`);
  },

  // 删除历史记录
  async deleteById(id: string) {
    return apiRequest(`/history/${id}`, {
      method: "DELETE",
    });
  },

  // 批量删除
  async batchDelete(ids: string[]) {
    return apiRequest("/history/batch", {
      method: "DELETE",
      body: JSON.stringify(ids),
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

// 统计API
export const statsApi = {
  async getSummary() {
    return apiRequest<{
      total_generations: number;
      successful_generations: number;
      failed_generations: number;
      by_model: Array<{
        model: string;
        count: number;
        latest_generation?: string;
      }>;
      recent_activity: Array<{
        date: string;
        count: number;
      }>;
    }>("/stats/summary");
  },
};
