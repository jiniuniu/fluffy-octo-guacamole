// lib/diagram/utils.ts
// 集成你现有的布局算法的工具函数

import type { GraphInput } from "./types";
import { defaultTheme } from "./theme";
import { layoutWithDagre } from "./layout";
import { graphToExcalidraw } from "./convert";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

/**
 * 将后端返回的 GraphInput 转换为 Excalidraw 场景
 */
export async function convertGraphToExcalidraw(graphData: GraphInput) {
  try {
    console.log("开始转换图数据:", graphData);

    // 1. 测量函数 - 根据节点内容计算尺寸
    const measure = (node: any, style: any) => {
      const len = Math.max(2, node.label?.length ?? 0);
      const w =
        style.paddingX * 2 + Math.max(7, style.fontSize * 0.6) * len + 12;
      const h = style.paddingY * 2 + style.fontSize + 6;
      return {
        width: Math.min(Math.max(w, 120), 420),
        height: Math.max(h, 40),
      };
    };

    // 2. 样式解析器 - 根据节点类型返回样式
    const styleResolver = (id: string) => {
      const node = graphData.nodes.find((x) => x.id === id);
      if (!node) return defaultTheme.defaults.node;

      const base = defaultTheme.defaults.node;
      const patch = (node.kind ? defaultTheme.node[node.kind] : {}) || {};
      return { ...base, ...patch } as any;
    };

    // 3. 使用 dagre 算法进行布局
    const positioned = layoutWithDagre(
      graphData,
      {
        measure,
        fallbackMeasure: (label) => ({ width: 160, height: 64 }),
      },
      styleResolver
    );

    console.log("布局完成:", positioned);

    // 4. 转换为 Excalidraw 格式
    const scene = graphToExcalidraw(positioned, { theme: defaultTheme });

    console.log("转换为Excalidraw格式完成:", scene);

    return scene;
  } catch (error) {
    console.error("转换失败:", error);
    throw new Error(
      `图表转换失败: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
}

/**
 * 扩展的默认主题 - 支持所有新的节点类型
 */
export const extendedTheme = {
  defaults: {
    node: {
      backgroundColor: "#ffffff",
      strokeColor: "#000000",
      fontSize: 14,
      paddingX: 12,
      paddingY: 8,
    },
  },
  node: {
    // 核心组件 - 蓝色系
    service: { backgroundColor: "#e3f2fd", strokeColor: "#1976d2" },
    microservice: { backgroundColor: "#e8f5e8", strokeColor: "#388e3c" },
    api: { backgroundColor: "#fff3e0", strokeColor: "#f57c00" },
    gateway: { backgroundColor: "#f3e5f5", strokeColor: "#7b1fa2" },
    proxy: { backgroundColor: "#fce4ec", strokeColor: "#c2185b" },
    balancer: { backgroundColor: "#e0f2f1", strokeColor: "#00796b" },

    // 数据层 - 绿色系
    db: { backgroundColor: "#e8f5e8", strokeColor: "#2e7d32" },
    cache: { backgroundColor: "#fff8e1", strokeColor: "#f57f17" },
    search: { backgroundColor: "#f1f8e9", strokeColor: "#689f38" },
    warehouse: { backgroundColor: "#e0f7fa", strokeColor: "#0097a7" },
    lake: { backgroundColor: "#e3f2fd", strokeColor: "#0288d1" },
    stream: { backgroundColor: "#f9fbe7", strokeColor: "#827717" },

    // 消息通信 - 橙色系
    queue: { backgroundColor: "#fff3e0", strokeColor: "#ef6c00" },
    broker: { backgroundColor: "#ffecb3", strokeColor: "#ff8f00" },
    pubsub: { backgroundColor: "#ffe0b2", strokeColor: "#f57c00" },
    eventbus: { backgroundColor: "#ffcc02", strokeColor: "#e65100" },
    webhook: { backgroundColor: "#ffab91", strokeColor: "#d84315" },

    // 基础设施 - 灰色系
    container: { backgroundColor: "#f5f5f5", strokeColor: "#616161" },
    cluster: { backgroundColor: "#fafafa", strokeColor: "#424242" },
    vm: { backgroundColor: "#eeeeee", strokeColor: "#757575" },
    serverless: { backgroundColor: "#e8eaf6", strokeColor: "#3f51b5" },
    edge: { backgroundColor: "#f3e5f5", strokeColor: "#9c27b0" },
    cdn: { backgroundColor: "#e1f5fe", strokeColor: "#0277bd" },

    // 安全认证 - 红色系
    auth: { backgroundColor: "#ffebee", strokeColor: "#c62828" },
    oauth: { backgroundColor: "#fce4ec", strokeColor: "#ad1457" },
    firewall: { backgroundColor: "#f3e5f5", strokeColor: "#6a1b9a" },
    vault: { backgroundColor: "#e8eaf6", strokeColor: "#303f9f" },
    certificate: { backgroundColor: "#e0f2f1", strokeColor: "#00695c" },

    // 监控运维 - 紫色系
    observability: { backgroundColor: "#f3e5f5", strokeColor: "#7b1fa2" },
    logging: { backgroundColor: "#ede7f6", strokeColor: "#512da8" },
    metrics: { backgroundColor: "#e8eaf6", strokeColor: "#303f9f" },
    tracing: { backgroundColor: "#e1f5fe", strokeColor: "#0277bd" },
    alerting: { backgroundColor: "#fff3e0", strokeColor: "#ef6c00" },
    cicd: { backgroundColor: "#e0f7fa", strokeColor: "#00838f" },

    // 业务层 - 青色系
    actor: { backgroundColor: "#e0f7fa", strokeColor: "#00acc1" },
    frontend: { backgroundColor: "#b2dfdb", strokeColor: "#00695c" },
    mobile: { backgroundColor: "#a7ffeb", strokeColor: "#00bfa5" },
    desktop: { backgroundColor: "#84ffff", strokeColor: "#0091ea" },
    bot: { backgroundColor: "#80deea", strokeColor: "#0097a7" },

    // 外部系统 - 棕色系
    external: { backgroundColor: "#efebe9", strokeColor: "#5d4037" },
    saas: { backgroundColor: "#d7ccc8", strokeColor: "#6d4c41" },
    partner: { backgroundColor: "#bcaaa4", strokeColor: "#795548" },
    payment: { backgroundColor: "#a1887f", strokeColor: "#8d6e63" },
    notification: { backgroundColor: "#8d6e63", strokeColor: "#6d4c41" },

    // 网络层 - 深蓝色系
    dns: { backgroundColor: "#e3f2fd", strokeColor: "#1565c0" },
    vpn: { backgroundColor: "#e8eaf6", strokeColor: "#283593" },
    tunnel: { backgroundColor: "#f3e5f5", strokeColor: "#4527a0" },
    mesh: { backgroundColor: "#ede7f6", strokeColor: "#6a1b9a" },
  },
};

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
