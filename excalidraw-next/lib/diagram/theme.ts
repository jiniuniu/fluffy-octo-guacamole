// lib/diagram/theme.ts
import type { NodeKind, NodeStyle, Theme } from "./types";

export const defaultTheme: Theme = {
  defaults: {
    node: {
      backgroundColor: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 2,
      fontSize: 14,
      fontFamily: 1, // Virgil
      textColor: "#333333",
      paddingX: 12,
      paddingY: 8,
      borderRadius: 8,
    },
    edge: {
      strokeColor: "#666666",
      strokeWidth: 2,
      strokeStyle: "solid",
      arrowhead: "triangle",
    },
    group: {
      backgroundColor: "#f8f9fa",
      strokeColor: "#e9ecef",
      strokeWidth: 2,
      strokeStyle: "dashed",
      opacity: 50,
    },
  },
  node: {
    // 🔧 核心组件 - 蓝色系
    service: {
      backgroundColor: "#e3f2fd",
      strokeColor: "#1976d2",
      textColor: "#0d47a1",
    },
    microservice: {
      backgroundColor: "#e8f5e8",
      strokeColor: "#388e3c",
      textColor: "#1b5e20",
    },
    api: {
      backgroundColor: "#fff3e0",
      strokeColor: "#f57c00",
      textColor: "#e65100",
    },
    gateway: {
      backgroundColor: "#f3e5f5",
      strokeColor: "#7b1fa2",
      textColor: "#4a148c",
    },
    proxy: {
      backgroundColor: "#fce4ec",
      strokeColor: "#c2185b",
      textColor: "#880e4f",
    },
    balancer: {
      backgroundColor: "#e0f2f1",
      strokeColor: "#00796b",
      textColor: "#004d40",
    },

    // 💾 数据层 - 绿色系
    db: {
      backgroundColor: "#e8f5e8",
      strokeColor: "#2e7d32",
      textColor: "#1b5e20",
    },
    cache: {
      backgroundColor: "#fff8e1",
      strokeColor: "#f57f17",
      textColor: "#e65100",
    },
    search: {
      backgroundColor: "#f1f8e9",
      strokeColor: "#689f38",
      textColor: "#33691e",
    },
    warehouse: {
      backgroundColor: "#e0f7fa",
      strokeColor: "#0097a7",
      textColor: "#006064",
    },
    lake: {
      backgroundColor: "#e3f2fd",
      strokeColor: "#0288d1",
      textColor: "#01579b",
    },
    stream: {
      backgroundColor: "#f9fbe7",
      strokeColor: "#827717",
      textColor: "#33691e",
    },

    // 📨 消息通信 - 橙色系
    queue: {
      backgroundColor: "#fff3e0",
      strokeColor: "#ef6c00",
      textColor: "#e65100",
    },
    broker: {
      backgroundColor: "#ffecb3",
      strokeColor: "#ff8f00",
      textColor: "#e65100",
    },
    pubsub: {
      backgroundColor: "#ffe0b2",
      strokeColor: "#f57c00",
      textColor: "#e65100",
    },
    eventbus: {
      backgroundColor: "#ffcc02",
      strokeColor: "#e65100",
      textColor: "#bf360c",
    },
    webhook: {
      backgroundColor: "#ffab91",
      strokeColor: "#d84315",
      textColor: "#bf360c",
    },

    // ☁️ 基础设施 - 灰色系
    container: {
      backgroundColor: "#f5f5f5",
      strokeColor: "#616161",
      textColor: "#212121",
    },
    cluster: {
      backgroundColor: "#fafafa",
      strokeColor: "#424242",
      textColor: "#212121",
    },
    vm: {
      backgroundColor: "#eeeeee",
      strokeColor: "#757575",
      textColor: "#424242",
    },
    serverless: {
      backgroundColor: "#e8eaf6",
      strokeColor: "#3f51b5",
      textColor: "#1a237e",
    },
    edge: {
      backgroundColor: "#f3e5f5",
      strokeColor: "#9c27b0",
      textColor: "#4a148c",
    },
    cdn: {
      backgroundColor: "#e1f5fe",
      strokeColor: "#0277bd",
      textColor: "#01579b",
    },

    // 🔐 安全认证 - 红色系
    auth: {
      backgroundColor: "#ffebee",
      strokeColor: "#c62828",
      textColor: "#b71c1c",
    },
    oauth: {
      backgroundColor: "#fce4ec",
      strokeColor: "#ad1457",
      textColor: "#880e4f",
    },
    firewall: {
      backgroundColor: "#f3e5f5",
      strokeColor: "#6a1b9a",
      textColor: "#4a148c",
    },
    vault: {
      backgroundColor: "#e8eaf6",
      strokeColor: "#303f9f",
      textColor: "#1a237e",
    },
    certificate: {
      backgroundColor: "#e0f2f1",
      strokeColor: "#00695c",
      textColor: "#004d40",
    },

    // 📊 监控运维 - 紫色系
    observability: {
      backgroundColor: "#f3e5f5",
      strokeColor: "#7b1fa2",
      textColor: "#4a148c",
    },
    logging: {
      backgroundColor: "#ede7f6",
      strokeColor: "#512da8",
      textColor: "#311b92",
    },
    metrics: {
      backgroundColor: "#e8eaf6",
      strokeColor: "#303f9f",
      textColor: "#1a237e",
    },
    tracing: {
      backgroundColor: "#e1f5fe",
      strokeColor: "#0277bd",
      textColor: "#01579b",
    },
    alerting: {
      backgroundColor: "#fff3e0",
      strokeColor: "#ef6c00",
      textColor: "#e65100",
    },
    cicd: {
      backgroundColor: "#e0f7fa",
      strokeColor: "#00838f",
      textColor: "#006064",
    },

    // 👤 业务层 - 青色系
    actor: {
      backgroundColor: "#e0f7fa",
      strokeColor: "#00acc1",
      textColor: "#006064",
    },
    frontend: {
      backgroundColor: "#b2dfdb",
      strokeColor: "#00695c",
      textColor: "#004d40",
    },
    mobile: {
      backgroundColor: "#a7ffeb",
      strokeColor: "#00bfa5",
      textColor: "#004d40",
    },
    desktop: {
      backgroundColor: "#84ffff",
      strokeColor: "#0091ea",
      textColor: "#01579b",
    },
    bot: {
      backgroundColor: "#80deea",
      strokeColor: "#0097a7",
      textColor: "#006064",
    },

    // 🌐 外部系统 - 棕色系
    external: {
      backgroundColor: "#efebe9",
      strokeColor: "#5d4037",
      textColor: "#3e2723",
    },
    saas: {
      backgroundColor: "#d7ccc8",
      strokeColor: "#6d4c41",
      textColor: "#3e2723",
    },
    partner: {
      backgroundColor: "#bcaaa4",
      strokeColor: "#795548",
      textColor: "#3e2723",
    },
    payment: {
      backgroundColor: "#a1887f",
      strokeColor: "#8d6e63",
      textColor: "#3e2723",
    },
    notification: {
      backgroundColor: "#8d6e63",
      strokeColor: "#6d4c41",
      textColor: "#3e2723",
    },

    // 🌍 网络层 - 深蓝色系
    dns: {
      backgroundColor: "#e3f2fd",
      strokeColor: "#1565c0",
      textColor: "#0d47a1",
    },
    vpn: {
      backgroundColor: "#e8eaf6",
      strokeColor: "#283593",
      textColor: "#1a237e",
    },
    tunnel: {
      backgroundColor: "#f3e5f5",
      strokeColor: "#4527a0",
      textColor: "#311b92",
    },
    mesh: {
      backgroundColor: "#ede7f6",
      strokeColor: "#6a1b9a",
      textColor: "#4a148c",
    },
  },
  group: {
    cluster: {
      backgroundColor: "#f8f9fa",
      strokeColor: "#dee2e6",
      strokeWidth: 2,
      strokeStyle: "dashed",
      opacity: 40,
    },
    lane: {
      backgroundColor: "#fff3cd",
      strokeColor: "#ffc107",
      strokeWidth: 2,
      strokeStyle: "solid",
      opacity: 30,
    },
  },
};

// 暗色主题
export const darkTheme: Theme = {
  ...defaultTheme,
  defaults: {
    ...defaultTheme.defaults,
    node: {
      ...defaultTheme.defaults.node,
      backgroundColor: "#2d3748",
      strokeColor: "#e2e8f0",
      textColor: "#f7fafc",
    },
    edge: {
      ...defaultTheme.defaults.edge,
      strokeColor: "#a0aec0",
    },
    group: {
      ...defaultTheme.defaults.group,
      backgroundColor: "#1a202c",
      strokeColor: "#4a5568",
    },
  },
  node: {
    // 🔧 核心组件 - 暗色版
    service: {
      backgroundColor: "#2c5282",
      strokeColor: "#63b3ed",
      textColor: "#e2e8f0",
    },
    microservice: {
      backgroundColor: "#276749",
      strokeColor: "#68d391",
      textColor: "#f0fff4",
    },
    api: {
      backgroundColor: "#c05621",
      strokeColor: "#fbb965",
      textColor: "#fffaf0",
    },
    gateway: {
      backgroundColor: "#553c9a",
      strokeColor: "#b794f6",
      textColor: "#faf5ff",
    },
    proxy: {
      backgroundColor: "#97266d",
      strokeColor: "#f687b3",
      textColor: "#fff5f7",
    },
    balancer: {
      backgroundColor: "#285e61",
      strokeColor: "#81e6d9",
      textColor: "#e6fffa",
    },

    // 💾 数据层 - 暗色版
    db: {
      backgroundColor: "#22543d",
      strokeColor: "#68d391",
      textColor: "#f0fff4",
    },
    cache: {
      backgroundColor: "#b7791f",
      strokeColor: "#fbd38d",
      textColor: "#fffaf0",
    },
    search: {
      backgroundColor: "#4a5568",
      strokeColor: "#a0aec0",
      textColor: "#f7fafc",
    },
    warehouse: {
      backgroundColor: "#0987a0",
      strokeColor: "#76e4f7",
      textColor: "#e6fffa",
    },
    lake: {
      backgroundColor: "#1e40af",
      strokeColor: "#60a5fa",
      textColor: "#eff6ff",
    },
    stream: {
      backgroundColor: "#365314",
      strokeColor: "#84cc16",
      textColor: "#f7fee7",
    },

    // 📨 消息通信 - 暗色版
    queue: {
      backgroundColor: "#c05621",
      strokeColor: "#fbb965",
      textColor: "#fffaf0",
    },
    broker: {
      backgroundColor: "#d69e2e",
      strokeColor: "#f6e05e",
      textColor: "#fffff0",
    },
    pubsub: {
      backgroundColor: "#c05621",
      strokeColor: "#fbb965",
      textColor: "#fffaf0",
    },
    eventbus: {
      backgroundColor: "#dd6b20",
      strokeColor: "#fed7aa",
      textColor: "#fffaf0",
    },
    webhook: {
      backgroundColor: "#c53030",
      strokeColor: "#fc8181",
      textColor: "#fed7d7",
    },

    // ☁️ 基础设施 - 暗色版
    container: {
      backgroundColor: "#4a5568",
      strokeColor: "#cbd5e0",
      textColor: "#f7fafc",
    },
    cluster: {
      backgroundColor: "#2d3748",
      strokeColor: "#a0aec0",
      textColor: "#e2e8f0",
    },
    vm: {
      backgroundColor: "#718096",
      strokeColor: "#e2e8f0",
      textColor: "#1a202c",
    },
    serverless: {
      backgroundColor: "#3182ce",
      strokeColor: "#90cdf4",
      textColor: "#ebf8ff",
    },
    edge: {
      backgroundColor: "#805ad5",
      strokeColor: "#d6bcfa",
      textColor: "#faf5ff",
    },
    cdn: {
      backgroundColor: "#0987a0",
      strokeColor: "#76e4f7",
      textColor: "#e6fffa",
    },

    // 🔐 安全认证 - 暗色版
    auth: {
      backgroundColor: "#c53030",
      strokeColor: "#fc8181",
      textColor: "#fed7d7",
    },
    oauth: {
      backgroundColor: "#97266d",
      strokeColor: "#f687b3",
      textColor: "#fff5f7",
    },
    firewall: {
      backgroundColor: "#553c9a",
      strokeColor: "#b794f6",
      textColor: "#faf5ff",
    },
    vault: {
      backgroundColor: "#2c5282",
      strokeColor: "#63b3ed",
      textColor: "#ebf8ff",
    },
    certificate: {
      backgroundColor: "#285e61",
      strokeColor: "#81e6d9",
      textColor: "#e6fffa",
    },

    // 📊 监控运维 - 暗色版
    observability: {
      backgroundColor: "#553c9a",
      strokeColor: "#b794f6",
      textColor: "#faf5ff",
    },
    logging: {
      backgroundColor: "#44337a",
      strokeColor: "#a78bfa",
      textColor: "#f5f3ff",
    },
    metrics: {
      backgroundColor: "#2c5282",
      strokeColor: "#63b3ed",
      textColor: "#ebf8ff",
    },
    tracing: {
      backgroundColor: "#0987a0",
      strokeColor: "#76e4f7",
      textColor: "#e6fffa",
    },
    alerting: {
      backgroundColor: "#c05621",
      strokeColor: "#fbb965",
      textColor: "#fffaf0",
    },
    cicd: {
      backgroundColor: "#0d9488",
      strokeColor: "#5eead4",
      textColor: "#f0fdfa",
    },

    // 👤 业务层 - 暗色版
    actor: {
      backgroundColor: "#0891b2",
      strokeColor: "#67e8f9",
      textColor: "#ecfeff",
    },
    frontend: {
      backgroundColor: "#047857",
      strokeColor: "#6ee7b7",
      textColor: "#ecfdf5",
    },
    mobile: {
      backgroundColor: "#059669",
      strokeColor: "#a7f3d0",
      textColor: "#ecfdf5",
    },
    desktop: {
      backgroundColor: "#0284c7",
      strokeColor: "#7dd3fc",
      textColor: "#f0f9ff",
    },
    bot: {
      backgroundColor: "#0891b2",
      strokeColor: "#67e8f9",
      textColor: "#ecfeff",
    },

    // 🌐 外部系统 - 暗色版
    external: {
      backgroundColor: "#92400e",
      strokeColor: "#d97706",
      textColor: "#fef3c7",
    },
    saas: {
      backgroundColor: "#a16207",
      strokeColor: "#eab308",
      textColor: "#fefce8",
    },
    partner: {
      backgroundColor: "#b45309",
      strokeColor: "#f59e0b",
      textColor: "#fffbeb",
    },
    payment: {
      backgroundColor: "#c2410c",
      strokeColor: "#fb923c",
      textColor: "#fff7ed",
    },
    notification: {
      backgroundColor: "#dc2626",
      strokeColor: "#f87171",
      textColor: "#fef2f2",
    },

    // 🌍 网络层 - 暗色版
    dns: {
      backgroundColor: "#1e40af",
      strokeColor: "#60a5fa",
      textColor: "#eff6ff",
    },
    vpn: {
      backgroundColor: "#1e3a8a",
      strokeColor: "#3b82f6",
      textColor: "#dbeafe",
    },
    tunnel: {
      backgroundColor: "#581c87",
      strokeColor: "#a855f7",
      textColor: "#f3e8ff",
    },
    mesh: {
      backgroundColor: "#7c2d12",
      strokeColor: "#ea580c",
      textColor: "#fff7ed",
    },
  },
  group: {
    cluster: {
      backgroundColor: "#1a202c",
      strokeColor: "#4a5568",
      strokeWidth: 2,
      strokeStyle: "dashed",
      opacity: 60,
    },
    lane: {
      backgroundColor: "#744210",
      strokeColor: "#d69e2e",
      strokeWidth: 2,
      strokeStyle: "solid",
      opacity: 40,
    },
  },
};

// 高对比度主题（无障碍友好）
export const highContrastTheme: Theme = {
  ...defaultTheme,
  defaults: {
    ...defaultTheme.defaults,
    node: {
      ...defaultTheme.defaults.node,
      backgroundColor: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 3,
      textColor: "#000000",
    },
  },
  node: Object.fromEntries(
    Object.keys(defaultTheme.node).map((kind) => [
      kind,
      {
        backgroundColor: "#ffffff",
        strokeColor: "#000000",
        strokeWidth: 3,
        textColor: "#000000",
      },
    ])
  ) as Record<NodeKind, Partial<NodeStyle>>,
};

// 节点类型到图标的映射
export const nodeIcons: Record<NodeKind, string> = {
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

// 主题切换工具
export const themes = {
  light: defaultTheme,
  dark: darkTheme,
  highContrast: highContrastTheme,
} as const;

export type ThemeName = keyof typeof themes;

// 获取主题
export function getTheme(themeName: ThemeName = "light"): Theme {
  return themes[themeName] || defaultTheme;
}

// 获取节点显示文本（包含图标）
export function getNodeDisplayText(node: {
  label: string;
  kind: NodeKind;
}): string {
  const icon = nodeIcons[node.kind] || "📄";
  return `${icon} ${node.label}`;
}

// 根据节点类型获取建议的尺寸
export function getNodeDimensions(node: { label: string; kind: NodeKind }): {
  width: number;
  height: number;
} {
  const displayText = getNodeDisplayText(node);
  const baseWidth = displayText.length * 8; // 大概估算

  // 根据节点类型调整基础尺寸
  const typeMultiplier: Record<string, number> = {
    // 较宽的组件
    gateway: 1.2,
    balancer: 1.2,
    warehouse: 1.2,
    observability: 1.3,

    // 较窄的组件
    cache: 0.9,
    queue: 0.9,
    auth: 0.9,

    // 标准尺寸
    default: 1.0,
  };

  const multiplier = typeMultiplier[node.kind] || typeMultiplier.default;
  const width = Math.max(Math.min(baseWidth * multiplier + 40, 300), 120);
  const height = 60;

  return { width: Math.round(width), height };
}

// 获取节点分类颜色
export function getNodeCategoryColor(kind: NodeKind): string {
  const categoryColors = {
    // 核心组件 - 蓝色系
    service: "#1976d2",
    microservice: "#388e3c",
    api: "#f57c00",
    gateway: "#7b1fa2",
    proxy: "#c2185b",
    balancer: "#00796b",

    // 数据层 - 绿色系
    db: "#2e7d32",
    cache: "#f57f17",
    search: "#689f38",
    warehouse: "#0097a7",
    lake: "#0288d1",
    stream: "#827717",

    // 消息通信 - 橙色系
    queue: "#ef6c00",
    broker: "#ff8f00",
    pubsub: "#f57c00",
    eventbus: "#e65100",
    webhook: "#d84315",

    // 基础设施 - 灰色系
    container: "#616161",
    cluster: "#424242",
    vm: "#757575",
    serverless: "#3f51b5",
    edge: "#9c27b0",
    cdn: "#0277bd",

    // 安全认证 - 红色系
    auth: "#c62828",
    oauth: "#ad1457",
    firewall: "#6a1b9a",
    vault: "#303f9f",
    certificate: "#00695c",

    // 监控运维 - 紫色系
    observability: "#7b1fa2",
    logging: "#512da8",
    metrics: "#303f9f",
    tracing: "#0277bd",
    alerting: "#ef6c00",
    cicd: "#00838f",

    // 业务层 - 青色系
    actor: "#00acc1",
    frontend: "#00695c",
    mobile: "#00bfa5",
    desktop: "#0091ea",
    bot: "#0097a7",

    // 外部系统 - 棕色系
    external: "#5d4037",
    saas: "#6d4c41",
    partner: "#795548",
    payment: "#8d6e63",
    notification: "#6d4c41",

    // 网络层 - 深蓝色系
    dns: "#1565c0",
    vpn: "#283593",
    tunnel: "#4527a0",
    mesh: "#6a1b9a",
  };

  return categoryColors[kind] || "#666666";
}

// 导出类型
export type { NodeKind } from "./types";
