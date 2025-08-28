// lib/diagram/layout.ts
import dagre from "@dagrejs/dagre";
import type { GraphInput, PositionedGraph, LayoutOptions } from "./types";

/**
 * 使用 Dagre 算法进行图布局
 */
export function layoutWithDagre(
  graph: GraphInput,
  options: LayoutOptions,
  styleResolver?: (id: string) => any
): PositionedGraph {
  // 创建 dagre 图实例
  const g = new dagre.graphlib.Graph();

  // 设置图的默认配置
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: graph.rankdir || "LR",
    nodesep: 50, // 节点间距
    edgesep: 20, // 边间距
    ranksep: 80, // 层间距
  });

  // 添加节点到 dagre 图
  for (const node of graph.nodes) {
    const style = styleResolver ? styleResolver(node.id) : {};
    const dimensions = options.measure
      ? options.measure(node, style)
      : options.fallbackMeasure(node.label);

    g.setNode(node.id, {
      ...node,
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  // 添加边到 dagre 图
  for (const edge of graph.edges) {
    g.setEdge(edge.from, edge.to, {
      ...edge,
    });
  }

  // 执行布局算法
  dagre.layout(g);

  // 提取布局后的节点位置
  const positionedNodes = graph.nodes.map((node) => {
    const dagreNode = g.node(node.id);
    return {
      ...node,
      x: dagreNode.x - dagreNode.width / 2, // dagre 返回中心点，转换为左上角
      y: dagreNode.y - dagreNode.height / 2,
      width: dagreNode.width,
      height: dagreNode.height,
    };
  });

  // 提取布局后的边路径
  const positionedEdges = graph.edges.map((edge) => {
    const dagreEdge = g.edge(edge.from, edge.to);
    return {
      ...edge,
      points: dagreEdge.points || [],
    };
  });

  // 计算分组的边界框
  const positionedGroups = (graph.groups || []).map((group) => {
    const members = group.members
      .map((id) => positionedNodes.find((n) => n.id === id))
      .filter(Boolean);

    if (members.length === 0) {
      return { ...group, x: 0, y: 0, width: 100, height: 100 };
    }

    const padding = 30;
    const minX = Math.min(...members.map((n) => n!.x)) - padding;
    const minY = Math.min(...members.map((n) => n!.y)) - padding;
    const maxX = Math.max(...members.map((n) => n!.x + n!.width)) + padding;
    const maxY = Math.max(...members.map((n) => n!.y + n!.height)) + padding;

    return {
      ...group,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  });

  return {
    ...graph,
    nodes: positionedNodes,
    edges: positionedEdges,
    groups: positionedGroups,
  };
}

/**
 * 优化节点尺寸测量
 */
export function createMeasureFunction(defaultFontSize: number = 14) {
  return (node: any, style: any = {}) => {
    const fontSize = style.fontSize || defaultFontSize;
    const paddingX = style.paddingX || 12;
    const paddingY = style.paddingY || 8;

    // 根据标签长度和字体大小计算宽度
    const textWidth = node.label ? node.label.length * fontSize * 0.6 : 60;
    const minWidth = 80;
    const maxWidth = 300;

    const width = Math.min(
      Math.max(textWidth + paddingX * 2, minWidth),
      maxWidth
    );
    const height = fontSize + paddingY * 2;

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  };
}

/**
 * 自动检测最佳布局方向
 */
export function detectOptimalRankdir(
  graph: GraphInput
): "LR" | "TB" | "RL" | "BT" {
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;

  // 分析图的特征
  const avgConnections = nodeCount > 0 ? edgeCount / nodeCount : 0;

  // 如果已经指定了方向，保持不变
  if (graph.rankdir && graph.rankdir !== "LR") {
    return graph.rankdir;
  }

  // 根据图的特征推荐布局
  if (avgConnections > 2 && nodeCount > 10) {
    return "TB"; // 复杂图使用垂直布局
  }

  return "LR"; // 默认左到右
}
