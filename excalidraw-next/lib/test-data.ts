// lib/test-data.ts - 测试数据文件
import type { GraphInput } from "./diagram/types";

// 推荐系统完整架构
export const recommendationSystemTestData: GraphInput = {
  rankdir: "LR",
  nodes: [
    // 用户层
    { id: "mobile_app", label: "移动应用", kind: "mobile" },
    { id: "web_app", label: "Web应用", kind: "frontend" },
    { id: "user", label: "用户", kind: "actor" },

    // 网关层
    { id: "api_gateway", label: "API网关", kind: "gateway" },
    { id: "load_balancer", label: "负载均衡器", kind: "balancer" },

    // 微服务层
    { id: "user_service", label: "用户服务", kind: "microservice" },
    { id: "item_service", label: "商品服务", kind: "microservice" },
    { id: "recommendation_service", label: "推荐服务", kind: "microservice" },
    { id: "rating_service", label: "评分服务", kind: "microservice" },
    { id: "search_service", label: "搜索服务", kind: "microservice" },

    // AI/ML层
    { id: "ml_pipeline", label: "ML训练流水线", kind: "cicd" },
    { id: "model_serving", label: "模型服务", kind: "serverless" },
    { id: "feature_store", label: "特征存储", kind: "warehouse" },

    // 数据层
    { id: "user_db", label: "用户数据库", kind: "db" },
    { id: "item_db", label: "商品数据库", kind: "db" },
    { id: "rating_db", label: "评分数据库", kind: "db" },
    { id: "redis_cache", label: "Redis缓存", kind: "cache" },
    { id: "elasticsearch", label: "Elasticsearch", kind: "search" },

    // 消息队列
    { id: "kafka", label: "Kafka消息队列", kind: "broker" },
    { id: "event_processor", label: "事件处理器", kind: "stream" },

    // 监控运维
    { id: "monitoring", label: "监控系统", kind: "observability" },
    { id: "logging", label: "日志系统", kind: "logging" },

    // 外部系统
    { id: "payment_system", label: "支付系统", kind: "payment" },
    { id: "analytics", label: "数据分析平台", kind: "external" },
  ],
  edges: [
    // 用户到网关
    { from: "user", to: "mobile_app", label: "使用" },
    { from: "user", to: "web_app", label: "访问" },
    { from: "mobile_app", to: "api_gateway", label: "API请求" },
    { from: "web_app", to: "api_gateway", label: "API请求" },

    // 网关到负载均衡
    { from: "api_gateway", to: "load_balancer", label: "路由" },

    // 负载均衡到微服务
    { from: "load_balancer", to: "user_service", label: "用户请求" },
    { from: "load_balancer", to: "item_service", label: "商品请求" },
    { from: "load_balancer", to: "recommendation_service", label: "推荐请求" },
    { from: "load_balancer", to: "rating_service", label: "评分请求" },
    { from: "load_balancer", to: "search_service", label: "搜索请求" },

    // 微服务到数据库
    { from: "user_service", to: "user_db", label: "查询用户" },
    { from: "item_service", to: "item_db", label: "查询商品" },
    { from: "rating_service", to: "rating_db", label: "存储评分" },

    // 缓存关系
    { from: "user_service", to: "redis_cache", label: "缓存用户" },
    { from: "item_service", to: "redis_cache", label: "缓存商品" },
    { from: "recommendation_service", to: "redis_cache", label: "缓存推荐" },

    // 搜索服务
    { from: "search_service", to: "elasticsearch", label: "全文搜索" },
    { from: "item_service", to: "elasticsearch", label: "索引商品" },

    // 推荐服务到AI/ML
    { from: "recommendation_service", to: "model_serving", label: "模型推理" },
    { from: "recommendation_service", to: "feature_store", label: "获取特征" },

    // ML流水线
    { from: "ml_pipeline", to: "feature_store", label: "特征工程" },
    { from: "ml_pipeline", to: "model_serving", label: "模型部署" },
    { from: "feature_store", to: "user_db", label: "用户特征" },
    { from: "feature_store", to: "item_db", label: "商品特征" },
    { from: "feature_store", to: "rating_db", label: "行为特征" },

    // 事件流
    { from: "user_service", to: "kafka", label: "用户事件" },
    { from: "item_service", to: "kafka", label: "商品事件" },
    { from: "rating_service", to: "kafka", label: "评分事件" },
    { from: "kafka", to: "event_processor", label: "处理事件" },
    { from: "event_processor", to: "feature_store", label: "更新特征" },

    // 监控和日志
    { from: "recommendation_service", to: "monitoring", label: "监控指标" },
    { from: "model_serving", to: "monitoring", label: "模型监控" },
    { from: "api_gateway", to: "logging", label: "访问日志" },
    { from: "recommendation_service", to: "logging", label: "推荐日志" },

    // 外部集成
    { from: "user_service", to: "payment_system", label: "支付信息" },
    { from: "event_processor", to: "analytics", label: "数据分析" },
    { from: "monitoring", to: "analytics", label: "性能数据" },
  ],
  groups: [
    {
      id: "frontend_group",
      label: "前端应用层",
      members: ["mobile_app", "web_app"],
      kind: "lane",
    },
    {
      id: "gateway_group",
      label: "网关层",
      members: ["api_gateway", "load_balancer"],
      kind: "cluster",
    },
    {
      id: "microservices_group",
      label: "微服务层",
      members: [
        "user_service",
        "item_service",
        "recommendation_service",
        "rating_service",
        "search_service",
      ],
      kind: "cluster",
    },
    {
      id: "ai_ml_group",
      label: "AI/ML层",
      members: ["ml_pipeline", "model_serving", "feature_store"],
      kind: "cluster",
    },
    {
      id: "data_group",
      label: "数据存储层",
      members: [
        "user_db",
        "item_db",
        "rating_db",
        "redis_cache",
        "elasticsearch",
      ],
      kind: "cluster",
    },
    {
      id: "messaging_group",
      label: "消息处理层",
      members: ["kafka", "event_processor"],
      kind: "lane",
    },
  ],
};

// 简化版微服务测试
export const simpleTestData: GraphInput = {
  rankdir: "LR",
  nodes: [
    { id: "user", label: "用户", kind: "actor" },
    { id: "frontend", label: "前端应用", kind: "frontend" },
    { id: "gateway", label: "API网关", kind: "gateway" },
    { id: "user_service", label: "用户服务", kind: "microservice" },
    { id: "order_service", label: "订单服务", kind: "microservice" },
    { id: "payment_service", label: "支付服务", kind: "microservice" },
    { id: "database", label: "数据库", kind: "db" },
    { id: "cache", label: "Redis缓存", kind: "cache" },
  ],
  edges: [
    { from: "user", to: "frontend", label: "访问" },
    { from: "frontend", to: "gateway", label: "API调用" },
    { from: "gateway", to: "user_service", label: "用户请求" },
    { from: "gateway", to: "order_service", label: "订单请求" },
    { from: "gateway", to: "payment_service", label: "支付请求" },
    { from: "user_service", to: "database", label: "查询" },
    { from: "order_service", to: "database", label: "存储" },
    { from: "payment_service", to: "database", label: "记录" },
    { from: "user_service", to: "cache", label: "缓存" },
    { from: "order_service", to: "cache", label: "缓存" },
  ],
};

// 垂直布局测试
export const verticalTestData: GraphInput = {
  rankdir: "TB",
  nodes: [
    { id: "cdn", label: "CDN", kind: "cdn" },
    { id: "load_balancer", label: "负载均衡", kind: "balancer" },
    { id: "web_servers", label: "Web服务器", kind: "cluster" },
    { id: "app_servers", label: "应用服务器", kind: "serverless" },
    { id: "database", label: "数据库集群", kind: "db" },
  ],
  edges: [
    { from: "cdn", to: "load_balancer", label: "流量分发" },
    { from: "load_balancer", to: "web_servers", label: "请求路由" },
    { from: "web_servers", to: "app_servers", label: "业务处理" },
    { from: "app_servers", to: "database", label: "数据访问" },
  ],
};

// 安全架构测试数据
export const securityTestData: GraphInput = {
  rankdir: "LR",
  nodes: [
    { id: "user", label: "用户", kind: "actor" },
    { id: "firewall", label: "防火墙", kind: "firewall" },
    { id: "waf", label: "Web应用防火墙", kind: "firewall" },
    { id: "auth_service", label: "认证服务", kind: "auth" },
    { id: "oauth_server", label: "OAuth服务器", kind: "oauth" },
    { id: "api_gateway", label: "API网关", kind: "gateway" },
    { id: "vault", label: "密钥管理", kind: "vault" },
    { id: "cert_manager", label: "证书管理", kind: "certificate" },
    { id: "audit_log", label: "审计日志", kind: "logging" },
    { id: "siem", label: "安全监控", kind: "observability" },
  ],
  edges: [
    { from: "user", to: "firewall", label: "网络访问" },
    { from: "firewall", to: "waf", label: "HTTP过滤" },
    { from: "waf", to: "auth_service", label: "身份验证" },
    { from: "auth_service", to: "oauth_server", label: "令牌颁发" },
    { from: "oauth_server", to: "api_gateway", label: "授权访问" },
    { from: "auth_service", to: "vault", label: "密钥获取" },
    { from: "api_gateway", to: "cert_manager", label: "SSL证书" },
    { from: "auth_service", to: "audit_log", label: "记录日志" },
    { from: "audit_log", to: "siem", label: "安全分析" },
  ],
};

// 大数据平台测试数据
export const bigDataTestData: GraphInput = {
  rankdir: "TB",
  nodes: [
    { id: "data_sources", label: "数据源", kind: "external" },
    { id: "kafka", label: "Kafka集群", kind: "broker" },
    { id: "spark_streaming", label: "Spark Streaming", kind: "stream" },
    { id: "hdfs", label: "HDFS存储", kind: "warehouse" },
    { id: "data_lake", label: "数据湖", kind: "lake" },
    { id: "spark_batch", label: "Spark批处理", kind: "cicd" },
    { id: "elasticsearch", label: "Elasticsearch", kind: "search" },
    { id: "kibana", label: "Kibana仪表板", kind: "observability" },
    { id: "ml_platform", label: "机器学习平台", kind: "serverless" },
    { id: "data_api", label: "数据API", kind: "api" },
  ],
  edges: [
    { from: "data_sources", to: "kafka", label: "实时数据流" },
    { from: "kafka", to: "spark_streaming", label: "流处理" },
    { from: "spark_streaming", to: "hdfs", label: "存储处理结果" },
    { from: "data_sources", to: "data_lake", label: "批量数据" },
    { from: "data_lake", to: "spark_batch", label: "批处理" },
    { from: "spark_batch", to: "elasticsearch", label: "索引数据" },
    { from: "elasticsearch", to: "kibana", label: "可视化" },
    { from: "hdfs", to: "ml_platform", label: "机器学习" },
    { from: "spark_batch", to: "data_api", label: "API服务" },
  ],
  groups: [
    {
      id: "ingestion_layer",
      label: "数据摄取层",
      members: ["data_sources", "kafka"],
      kind: "lane",
    },
    {
      id: "processing_layer",
      label: "数据处理层",
      members: ["spark_streaming", "spark_batch"],
      kind: "cluster",
    },
    {
      id: "storage_layer",
      label: "数据存储层",
      members: ["hdfs", "data_lake", "elasticsearch"],
      kind: "cluster",
    },
    {
      id: "service_layer",
      label: "服务层",
      members: ["kibana", "ml_platform", "data_api"],
      kind: "lane",
    },
  ],
};

// 云原生测试数据
export const cloudNativeTestData: GraphInput = {
  rankdir: "LR",
  nodes: [
    { id: "user", label: "用户", kind: "actor" },
    { id: "cdn", label: "CDN", kind: "cdn" },
    { id: "dns", label: "DNS解析", kind: "dns" },
    { id: "ingress", label: "Ingress控制器", kind: "gateway" },
    { id: "k8s_cluster", label: "Kubernetes集群", kind: "cluster" },
    { id: "pod1", label: "微服务Pod1", kind: "container" },
    { id: "pod2", label: "微服务Pod2", kind: "container" },
    { id: "pod3", label: "微服务Pod3", kind: "container" },
    { id: "service_mesh", label: "服务网格", kind: "mesh" },
    { id: "persistent_volume", label: "持久化存储", kind: "db" },
    { id: "prometheus", label: "Prometheus监控", kind: "metrics" },
    { id: "grafana", label: "Grafana仪表板", kind: "observability" },
    { id: "jaeger", label: "Jaeger链路追踪", kind: "tracing" },
  ],
  edges: [
    { from: "user", to: "dns", label: "域名解析" },
    { from: "dns", to: "cdn", label: "静态资源" },
    { from: "cdn", to: "ingress", label: "动态请求" },
    { from: "ingress", to: "k8s_cluster", label: "路由到集群" },
    { from: "k8s_cluster", to: "service_mesh", label: "服务发现" },
    { from: "service_mesh", to: "pod1", label: "流量管理" },
    { from: "service_mesh", to: "pod2", label: "负载均衡" },
    { from: "service_mesh", to: "pod3", label: "熔断限流" },
    { from: "pod1", to: "persistent_volume", label: "数据持久化" },
    { from: "pod2", to: "persistent_volume", label: "共享存储" },
    { from: "k8s_cluster", to: "prometheus", label: "指标收集" },
    { from: "prometheus", to: "grafana", label: "监控可视化" },
    { from: "service_mesh", to: "jaeger", label: "分布式追踪" },
  ],
  groups: [
    {
      id: "edge_layer",
      label: "边缘层",
      members: ["dns", "cdn"],
      kind: "lane",
    },
    {
      id: "kubernetes_cluster",
      label: "Kubernetes集群",
      members: ["pod1", "pod2", "pod3", "service_mesh"],
      kind: "cluster",
    },
    {
      id: "observability_stack",
      label: "可观测性栈",
      members: ["prometheus", "grafana", "jaeger"],
      kind: "cluster",
    },
  ],
};
