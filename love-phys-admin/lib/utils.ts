import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 时间格式化工具函数
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 1) return "刚刚";
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
  return `${Math.floor(diffInMinutes / 1440)}天前`;
}

// 模型相关工具函数
export function getModelName(model: string): string {
  return model === "claude" ? "Claude" : "Qwen";
}

export function getModelDisplayName(model: string): string {
  return model === "claude" ? "Claude Sonnet 4" : "Qwen Coder Plus";
}

// 文件下载工具函数
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/plain"
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 文本复制工具函数
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("复制失败:", err);
    return false;
  }
}
