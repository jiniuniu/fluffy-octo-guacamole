/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/diagram/convert.ts - 最终简化版
import type { GraphInput } from "./types";

// 节点图标映射
const nodeIcons: Record<string, string> = {
  // 核心组件
  service: "⚙️",
  microservice: "🔧",
  api: "🔌",
  gateway: "🚪",
  proxy: "🔀",
  balancer: "⚖️",
  // 数据层
  db: "🗄️",
  cache: "⚡",
  search: "🔍",
  warehouse: "🏭",
  lake: "🏞️",
  stream: "🌊",
  // 消息通信
  queue: "📥",
  broker: "📨",
  pubsub: "📡",
  eventbus: "🚌",
  webhook: "🪝",
  // 基础设施
  container: "📦",
  cluster: "🔗",
  vm: "💻",
  serverless: "⚡",
  edge: "🌐",
  cdn: "🚀",
  // 安全认证
  auth: "🔐",
  oauth: "🎫",
  firewall: "🛡️",
  vault: "🔒",
  certificate: "📜",
  // 监控运维
  observability: "👀",
  logging: "📋",
  metrics: "📊",
  tracing: "🔍",
  alerting: "🚨",
  cicd: "🔄",
  // 业务层
  actor: "👤",
  frontend: "🖥️",
  mobile: "📱",
  desktop: "🖥️",
  bot: "🤖",
  // 外部系统
  external: "🌍",
  saas: "☁️",
  partner: "🤝",
  payment: "💳",
  notification: "🔔",
  // 网络层
  dns: "🌐",
  vpn: "🔒",
  tunnel: "🚇",
  mesh: "🕸️",
};

// 节点样式映射
const nodeStyles: Record<
  string,
  { backgroundColor: string; strokeColor: string }
> = {
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
};

/**
 * 将后端返回的 GraphInput 转换为 Excalidraw 场景
 */
export async function convertGraphToExcalidraw(graphData: GraphInput) {
  try {
    console.log("🚀 开始转换图数据:", graphData);

    // 动态导入 Excalidraw 相关函数
    const { convertToExcalidrawElements } = await import(
      "@excalidraw/excalidraw"
    );
    const dagre = await import("@dagrejs/dagre");

    // 1. 创建 dagre 图进行布局
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: graphData.rankdir || "LR",
      nodesep: 50,
      edgesep: 20,
      ranksep: 80,
    });

    // 2. 添加节点到 dagre 图并计算尺寸
    for (const node of graphData.nodes) {
      const icon = nodeIcons[node.kind] || "📄";
      const displayText = `${icon} ${node.label}`;

      // 简单的尺寸计算
      const textWidth = displayText.length * 8;
      const width = Math.max(Math.min(textWidth + 40, 300), 120);
      const height = 60;

      g.setNode(node.id, {
        ...node,
        width,
        height,
      });
    }

    // 3. 添加边到 dagre 图
    for (const edge of graphData.edges) {
      g.setEdge(edge.from, edge.to, edge);
    }

    // 4. 执行布局
    dagre.layout(g);

    // 5. 创建骨架元素数组
    const skeletonElements: any[] = [];

    // 6. 添加节点元素
    for (const node of graphData.nodes) {
      const dagreNode = g.node(node.id);
      const icon = nodeIcons[node.kind] || "📄";
      const displayText = `${icon} ${node.label}`;
      const style = nodeStyles[node.kind] || {
        backgroundColor: "#ffffff",
        strokeColor: "#000000",
      };

      skeletonElements.push({
        type: "rectangle",
        x: dagreNode.x - dagreNode.width / 2,
        y: dagreNode.y - dagreNode.height / 2,
        width: dagreNode.width,
        height: dagreNode.height,
        backgroundColor: style.backgroundColor,
        strokeColor: style.strokeColor,
        strokeWidth: 2,
        label: {
          text: displayText,
          fontSize: 14,
          strokeColor: "#333333",
        },
      });
    }

    // 7. 添加边元素（箭头）
    for (const edge of graphData.edges) {
      const fromNode = g.node(edge.from);
      const toNode = g.node(edge.to);

      if (fromNode && toNode) {
        // 计算箭头位置
        const startX = fromNode.x + fromNode.width / 2;
        const startY = fromNode.y;
        const endX = toNode.x - toNode.width / 2;
        const endY = toNode.y;

        const arrowElement: any = {
          type: "arrow",
          x: startX,
          y: startY,
          width: endX - startX,
          height: endY - startY,
          strokeColor: "#666666",
          strokeWidth: 2,
        };

        // 添加标签（如果有）
        if (edge.label && edge.label.trim()) {
          arrowElement.label = {
            text: edge.label,
            fontSize: 12,
            strokeColor: "#555555",
          };
        }

        skeletonElements.push(arrowElement);
      }
    }

    // 8. 处理分组（如果有）
    if (graphData.groups && graphData.groups.length > 0) {
      for (const group of graphData.groups) {
        // 计算分组边界
        const members = group.members.map((id) => g.node(id)).filter(Boolean);

        if (members.length > 0) {
          const padding = 30;
          const minX =
            Math.min(...members.map((n) => n.x - n.width / 2)) - padding;
          const minY =
            Math.min(...members.map((n) => n.y - n.height / 2)) - padding;
          const maxX =
            Math.max(...members.map((n) => n.x + n.width / 2)) + padding;
          const maxY =
            Math.max(...members.map((n) => n.y + n.height / 2)) + padding;

          skeletonElements.unshift({
            type: "rectangle",
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            backgroundColor: group.kind === "cluster" ? "#f8f9fa" : "#fff3cd",
            strokeColor: group.kind === "cluster" ? "#e9ecef" : "#ffc107",
            strokeWidth: 2,
            strokeStyle: group.kind === "cluster" ? "dashed" : "solid",
            opacity: 30,
            label: {
              text: `📁 ${group.label}`,
              fontSize: 12,
              textAlign: "left",
            },
          });
        }
      }
    }

    console.log("🦴 创建的骨架元素:", skeletonElements);

    // 9. 使用 convertToExcalidrawElements 转换为完整元素
    const elements = convertToExcalidrawElements(skeletonElements);

    console.log("✨ 转换后的完整元素:", elements);
    console.log("📊 元素总数:", elements.length);

    return {
      elements,
      appState: {
        viewBackgroundColor: "#ffffff",
        theme: "light" as const,
      },
    };
  } catch (error) {
    console.error("❌ 转换失败:", error);

    // 提供更详细的错误信息
    if (error instanceof Error) {
      if (error.message.includes("convertToExcalidrawElements")) {
        throw new Error(
          "Excalidraw 转换函数不可用，请检查 @excalidraw/excalidraw 包是否正确安装"
        );
      }
      if (
        error.message.includes("dagre") ||
        error.message.includes("graphlib")
      ) {
        throw new Error(
          "Dagre 布局引擎不可用，请检查 @dagrejs/dagre 包是否正确安装"
        );
      }
    }

    throw new Error(
      `图表转换失败: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
}

// 为了保持向后兼容，导出一个别名
export { convertGraphToExcalidraw as graphToExcalidraw };
