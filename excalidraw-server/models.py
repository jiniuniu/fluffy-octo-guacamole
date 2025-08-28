from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# Pydantic模型定义
class Node(BaseModel):
    id: str = Field(description="节点唯一标识符，使用小写字母和下划线")
    label: str = Field(description="节点显示名称")
    kind: Literal[
        # 核心组件
        "service",
        "microservice",
        "api",
        "gateway",
        "proxy",
        "balancer",
        # 数据层
        "db",
        "cache",
        "search",
        "warehouse",
        "lake",
        "stream",
        # 消息通信
        "queue",
        "broker",
        "pubsub",
        "eventbus",
        "webhook",
        # 基础设施
        "container",
        "cluster",
        "vm",
        "serverless",
        "edge",
        "cdn",
        # 安全认证
        "auth",
        "oauth",
        "firewall",
        "vault",
        "certificate",
        # 监控运维
        "observability",
        "logging",
        "metrics",
        "tracing",
        "alerting",
        "cicd",
        # 业务层
        "actor",
        "frontend",
        "mobile",
        "desktop",
        "bot",
        # 外部系统
        "external",
        "saas",
        "partner",
        "payment",
        "notification",
        # 网络层
        "dns",
        "vpn",
        "tunnel",
        "mesh",
    ] = Field(description="节点类型，覆盖架构师常用的所有组件类型")


class Edge(BaseModel):
    from_: str = Field(alias="from", description="起始节点ID")
    to: str = Field(description="目标节点ID")
    label: str = Field(description="连接关系描述，简洁明了")


class Group(BaseModel):
    id: str = Field(description="分组唯一标识符")
    label: str = Field(description="分组显示名称")
    members: List[str] = Field(description="分组包含的节点ID列表")
    kind: Literal["cluster", "lane"] = Field(
        description="分组类型：cluster(集群), lane(泳道)"
    )


class GraphInput(BaseModel):
    rankdir: Literal["LR", "TB", "RL", "BT"] = Field(
        default="LR",
        description="布局方向：LR(左到右), TB(上到下), RL(右到左), BT(下到上)",
    )
    nodes: List[Node] = Field(description="图中所有节点")
    edges: List[Edge] = Field(description="图中所有连接关系")
    groups: Optional[List[Group]] = Field(default=None, description="可选的节点分组")
