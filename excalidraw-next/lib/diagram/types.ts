// lib/diagram/types.ts

// 基础图结构（LLM 生成的格式）
export interface GraphInput {
  rankdir: "LR" | "TB" | "RL" | "BT";
  nodes: Node[];
  edges: Edge[];
  groups?: Group[];
}

export interface Node {
  id: string;
  label: string;
  kind: NodeKind;
}

export interface Edge {
  from: string;
  to: string;
  label: string;
}

export interface Group {
  id: string;
  label: string;
  members: string[];
  kind: "cluster" | "lane";
}

// 节点类型枚举
export type NodeKind =
  // 核心组件
  | "service"
  | "microservice"
  | "api"
  | "gateway"
  | "proxy"
  | "balancer"
  // 数据层
  | "db"
  | "cache"
  | "search"
  | "warehouse"
  | "lake"
  | "stream"
  // 消息通信
  | "queue"
  | "broker"
  | "pubsub"
  | "eventbus"
  | "webhook"
  // 基础设施
  | "container"
  | "cluster"
  | "vm"
  | "serverless"
  | "edge"
  | "cdn"
  // 安全认证
  | "auth"
  | "oauth"
  | "firewall"
  | "vault"
  | "certificate"
  // 监控运维
  | "observability"
  | "logging"
  | "metrics"
  | "tracing"
  | "alerting"
  | "cicd"
  // 业务层
  | "actor"
  | "frontend"
  | "mobile"
  | "desktop"
  | "bot"
  // 外部系统
  | "external"
  | "saas"
  | "partner"
  | "payment"
  | "notification"
  // 网络层
  | "dns"
  | "vpn"
  | "tunnel"
  | "mesh";

// 布局后的图结构（包含位置信息）
export interface PositionedGraph
  extends Omit<GraphInput, "nodes" | "edges" | "groups"> {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  groups?: PositionedGroup[];
}

export interface PositionedNode extends Node {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedEdge extends Edge {
  points?: Array<{ x: number; y: number }>;
}

export interface PositionedGroup extends Group {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 布局选项
export interface LayoutOptions {
  measure?: (node: Node, style: any) => { width: number; height: number };
  fallbackMeasure: (label: string) => { width: number; height: number };
}

// 转换选项
export interface ConvertOptions {
  theme: Theme;
}

// 主题定义
export interface Theme {
  defaults: {
    node: NodeStyle;
    edge?: EdgeStyle;
    group?: GroupStyle;
  };
  node: Record<NodeKind, Partial<NodeStyle>>;
  edge?: Record<string, EdgeStyle>;
  group?: Record<"cluster" | "lane", GroupStyle>;
}

export interface NodeStyle {
  backgroundColor: string;
  strokeColor: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: number;
  textColor?: string;
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
}

export interface EdgeStyle {
  strokeColor: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  arrowhead?: "triangle" | "arrow" | "dot";
}

export interface GroupStyle {
  backgroundColor: string;
  strokeColor: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  opacity?: number;
}
