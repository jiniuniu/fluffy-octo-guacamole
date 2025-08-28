// lib/diagram/convert.ts
import type { PositionedGraph, ConvertOptions, GraphInput } from "./types";
import { getNodeDisplayText } from "./theme";

/**
 * 生成唯一ID（兼容Excalidraw格式）
 */
function generateId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  let result = "";
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 将布局后的图转换为 Excalidraw 元素
 */
export function graphToExcalidraw(
  graph: PositionedGraph,
  options: ConvertOptions
): { elements: any[]; appState: any } {
  const elements: any[] = [];
  const theme = options.theme;

  // 1. 先渲染分组（作为背景）
  if (graph.groups) {
    for (const group of graph.groups) {
      const groupStyle = theme.group?.[group.kind] || theme.defaults.group;

      // 分组背景矩形
      elements.push({
        type: "rectangle",
        id: generateId(),
        x: group.x,
        y: group.y,
        width: group.width,
        height: group.height,
        backgroundColor: groupStyle?.backgroundColor || "#f8f9fa",
        strokeColor: groupStyle?.strokeColor || "#e9ecef",
        strokeWidth: groupStyle?.strokeWidth || 2,
        strokeStyle: groupStyle?.strokeStyle || "dashed",
        roughness: 1,
        opacity: groupStyle?.opacity || 50,
        fillStyle: "solid",
        roundness: { type: 3, value: 16 },
        locked: false,
        link: null,
        customData: {
          groupId: group.id,
          groupLabel: group.label,
          groupKind: group.kind,
        },
      });

      // 分组标签
      const labelText = `📁 ${group.label}`;
      elements.push({
        type: "text",
        id: generateId(),
        x: group.x + 12,
        y: group.y + 8,
        width: labelText.length * 8,
        height: 20,
        text: labelText,
        fontSize: 16,
        fontFamily: 1,
        textAlign: "left",
        verticalAlign: "top",
        strokeColor: groupStyle?.strokeColor || "#666",
        backgroundColor: "transparent",
        fillStyle: "solid",
        roughness: 0,
        opacity: 100,
        locked: false,
        link: null,
      });
    }
  }

  // 2. 渲染节点
  for (const node of graph.nodes) {
    const nodeStyle = theme.node?.[node.kind] || theme.defaults.node;
    const displayText = getNodeDisplayText(node);

    // 节点矩形
    const rectId = generateId();
    elements.push({
      type: "rectangle",
      id: rectId,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      backgroundColor: nodeStyle?.backgroundColor || "#ffffff",
      strokeColor: nodeStyle?.strokeColor || "#000000",
      strokeWidth: nodeStyle?.strokeWidth || 2,
      fillStyle: "solid",
      roughness: 1,
      opacity: 100,
      roundness: { type: 3, value: 8 },
      locked: false,
      link: null,
      customData: {
        nodeId: node.id,
        nodeKind: node.kind,
        isArchNode: true,
      },
    });

    // 节点标签文本
    const textWidth = displayText.length * ((nodeStyle?.fontSize || 14) * 0.6);
    const textHeight = nodeStyle?.fontSize || 14;

    elements.push({
      type: "text",
      id: generateId(),
      x: node.x + (node.width - textWidth) / 2,
      y: node.y + (node.height - textHeight) / 2,
      width: textWidth,
      height: textHeight,
      text: displayText,
      fontSize: nodeStyle?.fontSize || 14,
      fontFamily: 1, // Virgil
      textAlign: "center",
      verticalAlign: "middle",
      strokeColor: nodeStyle?.textColor || "#333333",
      backgroundColor: "transparent",
      fillStyle: "solid",
      roughness: 0,
      opacity: 100,
      locked: false,
      link: null,
      containerId: rectId, // 绑定到节点矩形
      originalText: displayText,
    });
  }

  // 3. 渲染边
  for (const edge of graph.edges) {
    const fromNode = graph.nodes.find((n) => n.id === edge.from);
    const toNode = graph.nodes.find((n) => n.id === edge.to);

    if (!fromNode || !toNode) continue;

    // 计算连接点
    const startPoint = getConnectionPoint(fromNode, toNode, "start");
    const endPoint = getConnectionPoint(toNode, fromNode, "end");

    const edgeStyle = theme.defaults.edge;

    // 创建箭头
    const arrowId = generateId();
    elements.push({
      type: "arrow",
      id: arrowId,
      x: startPoint.x,
      y: startPoint.y,
      width: endPoint.x - startPoint.x,
      height: endPoint.y - startPoint.y,
      strokeColor: edgeStyle?.strokeColor || "#666666",
      strokeWidth: edgeStyle?.strokeWidth || 2,
      fillStyle: "solid",
      roughness: 1,
      opacity: 100,
      points: [
        [0, 0],
        [endPoint.x - startPoint.x, endPoint.y - startPoint.y],
      ],
      lastCommittedPoint: [
        endPoint.x - startPoint.x,
        endPoint.y - startPoint.y,
      ],
      startBinding: null,
      endBinding: null,
      startArrowhead: null,
      endArrowhead: edgeStyle?.arrowhead || "triangle",
      locked: false,
      link: null,
      customData: {
        edgeFrom: edge.from,
        edgeTo: edge.to,
        isArchEdge: true,
      },
    });

    // 边标签（如果有）
    if (edge.label) {
      const midX = (startPoint.x + endPoint.x) / 2;
      const midY = (startPoint.y + endPoint.y) / 2;
      const labelWidth = edge.label.length * 7;

      // 标签背景
      elements.push({
        type: "rectangle",
        id: generateId(),
        x: midX - labelWidth / 2 - 4,
        y: midY - 10,
        width: labelWidth + 8,
        height: 20,
        backgroundColor: "#ffffff",
        strokeColor: "transparent",
        fillStyle: "solid",
        roughness: 0,
        opacity: 90,
        locked: false,
        link: null,
      });

      // 标签文本
      elements.push({
        type: "text",
        id: generateId(),
        x: midX - labelWidth / 2,
        y: midY - 8,
        width: labelWidth,
        height: 16,
        text: edge.label,
        fontSize: 12,
        fontFamily: 1,
        textAlign: "center",
        verticalAlign: "middle",
        strokeColor: "#555555",
        backgroundColor: "transparent",
        fillStyle: "solid",
        roughness: 0,
        opacity: 100,
        locked: false,
        link: null,
      });
    }
  }

  return {
    elements,
    appState: {
      viewBackgroundColor: "#ffffff",
      currentItemStrokeColor: "#000000",
      currentItemBackgroundColor: "transparent",
      currentItemFillStyle: "solid",
      currentItemStrokeWidth: 2,
      currentItemRoughness: 1,
      currentItemOpacity: 100,
      gridSize: null,
      theme: "light",
      activeTool: { type: "selection" },
      penMode: false,
      penDetected: false,
    },
  };
}

/**
 * 计算节点间的连接点
 */
function getConnectionPoint(
  fromNode: any,
  toNode: any,
  type: "start" | "end"
): { x: number; y: number } {
  const fromCenter = {
    x: fromNode.x + fromNode.width / 2,
    y: fromNode.y + fromNode.height / 2,
  };

  const toCenter = {
    x: toNode.x + toNode.width / 2,
    y: toNode.y + toNode.height / 2,
  };

  // 简单版本：返回节点边缘的连接点
  if (type === "start") {
    // 从起始节点的右侧或下侧连接
    if (
      Math.abs(toCenter.x - fromCenter.x) > Math.abs(toCenter.y - fromCenter.y)
    ) {
      // 水平方向距离更大，使用左右连接
      return {
        x: toCenter.x > fromCenter.x ? fromNode.x + fromNode.width : fromNode.x,
        y: fromCenter.y,
      };
    } else {
      // 垂直方向距离更大，使用上下连接
      return {
        x: fromCenter.x,
        y:
          toCenter.y > fromCenter.y ? fromNode.y + fromNode.height : fromNode.y,
      };
    }
  } else {
    // 到目标节点的左侧或上侧连接
    if (
      Math.abs(toCenter.x - fromCenter.x) > Math.abs(toCenter.y - fromCenter.y)
    ) {
      return {
        x: fromCenter.x > toCenter.x ? toNode.x + toNode.width : toNode.x,
        y: toCenter.y,
      };
    } else {
      return {
        x: toCenter.x,
        y: fromCenter.y > toCenter.y ? toNode.y + toNode.height : toNode.y,
      };
    }
  }
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
export function detectOptimalRankdir(graph: GraphInput): string {
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
