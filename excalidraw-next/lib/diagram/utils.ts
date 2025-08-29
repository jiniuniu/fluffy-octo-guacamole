/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/diagram/utils.ts - 修复版本，移除对 convert.ts 的依赖

import type { GraphInput } from "./types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

/**
 * 将后端返回的 GraphInput 转换为 Excalidraw 场景
 * 直接从 convert.ts 导入转换函数
 */
export async function convertGraphToExcalidraw(graphData: GraphInput) {
  try {
    // 直接从 convert 模块导入转换函数
    const { convertGraphToExcalidraw: convertFn } = await import("./convert");
    return await convertFn(graphData);
  } catch (error) {
    console.error("转换失败:", error);
    throw new Error(
      `图表转换失败: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
}

/**
 * 验证后端返回的图数据
 */
export function validateGraphData(graphData: any): GraphInput {
  // 基本结构验证
  if (!graphData || typeof graphData !== "object") {
    throw new Error("无效的图数据格式");
  }

  if (!Array.isArray(graphData.nodes) || graphData.nodes.length === 0) {
    throw new Error("图数据必须包含至少一个节点");
  }

  if (!Array.isArray(graphData.edges)) {
    throw new Error("图数据必须包含边数组");
  }

  // 验证节点 ID 唯一性
  const nodeIds = graphData.nodes.map((n: any) => n.id);
  const uniqueNodeIds = new Set(nodeIds);
  if (nodeIds.length !== uniqueNodeIds.size) {
    throw new Error("节点ID必须唯一");
  }

  // 验证边引用
  for (const edge of graphData.edges) {
    if (!uniqueNodeIds.has(edge.from)) {
      throw new Error(`边引用了不存在的起始节点: ${edge.from}`);
    }
    if (!uniqueNodeIds.has(edge.to)) {
      throw new Error(`边引用了不存在的目标节点: ${edge.to}`);
    }
  }

  // 验证分组引用
  if (graphData.groups) {
    for (const group of graphData.groups) {
      if (!Array.isArray(group.members)) {
        throw new Error(`分组 '${group.id}' 的 members 必须是数组`);
      }
      for (const member of group.members) {
        if (!uniqueNodeIds.has(member)) {
          throw new Error(`分组 '${group.id}' 引用了不存在的节点: ${member}`);
        }
      }
    }
  }

  return graphData as GraphInput;
}

/**
 * 错误处理包装器
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("操作失败:", error);

      // 增强错误信息
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          throw new Error("网络请求失败，请检查后端服务是否启动");
        }
        if (error.message.includes("JSON")) {
          throw new Error("服务器返回数据格式错误");
        }
      }

      throw error;
    }
  };
}

/**
 * API 状态检查
 */
export function checkExcalidrawAPI(
  api: ExcalidrawImperativeAPI | null
): asserts api is ExcalidrawImperativeAPI {
  if (!api) {
    throw new Error("Excalidraw API 尚未初始化，请稍后重试");
  }
}

/**
 * 预设架构模板
 */
export const architectureTemplates = {
  microservices: {
    name: "微服务架构",
    prompt:
      "设计一个典型的微服务架构，包括API网关、用户服务、订单服务、支付服务、数据库和缓存",
    rankdir: "LR" as const,
  },
  bigdata: {
    name: "大数据平台",
    prompt:
      "设计一个大数据处理平台，包括数据采集、流处理、数据湖、数据仓库和分析服务",
    rankdir: "TB" as const,
  },
  cloudnative: {
    name: "云原生应用",
    prompt:
      "设计一个云原生应用架构，包括CDN、负载均衡、Kubernetes集群、微服务和监控系统",
    rankdir: "LR" as const,
  },
  security: {
    name: "零信任安全",
    prompt:
      "设计一个零信任安全架构，包括身份认证、访问控制、防火墙、密钥管理和审计日志",
    rankdir: "TB" as const,
  },
  aiml: {
    name: "AI/ML平台",
    prompt:
      "设计一个机器学习平台架构，包括数据预处理、模型训练、推理服务、模型仓库和监控",
    rankdir: "LR" as const,
  },
};

/**
 * 获取架构建议
 */
export function getArchitectureSuggestions(prompt: string): string[] {
  const keywords = prompt.toLowerCase();
  const suggestions: string[] = [];

  if (keywords.includes("微服务") || keywords.includes("microservice")) {
    suggestions.push("考虑添加服务注册发现、配置中心、熔断器等微服务基础设施");
  }

  if (keywords.includes("数据") || keywords.includes("大数据")) {
    suggestions.push("建议包含数据血缘、数据质量监控、元数据管理等");
  }

  if (keywords.includes("安全") || keywords.includes("认证")) {
    suggestions.push("考虑多因子认证、权限管理、审计日志等安全组件");
  }

  if (keywords.includes("AI") || keywords.includes("机器学习")) {
    suggestions.push("建议添加模型版本管理、A/B测试、模型监控等MLOps组件");
  }

  return suggestions;
}
