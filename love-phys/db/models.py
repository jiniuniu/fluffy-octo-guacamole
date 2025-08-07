# models.py
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# 枚举类型
class ModelType(str, Enum):
    CLAUDE = "claude"
    QWEN = "qwen"


class GenerationStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


# 请求模型
class GenerateContentRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500, description="物理问题")
    model: ModelType = Field(ModelType.CLAUDE, description="使用的模型")


class GenerateAnimationRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500, description="物理问题")
    explanation: str = Field(..., min_length=50, description="物理解释")
    model: ModelType = Field(ModelType.CLAUDE, description="使用的模型")


# 历史记录相关模型
class GenerationHistoryCreate(BaseModel):
    """创建历史记录的数据模型"""

    question: str
    explanation: str
    svg_code: str
    model: str
    status: GenerationStatus = GenerationStatus.SUCCESS
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class GenerationHistory(BaseModel):
    """历史记录完整模型"""

    id: str
    question: str
    explanation: str
    svg_code: str
    model: str
    status: GenerationStatus
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None


class GenerationHistoryResponse(BaseModel):
    """API响应的历史记录模型（可能隐藏某些字段）"""

    id: str
    question: str
    explanation: str
    svg_code: str
    model: str
    status: GenerationStatus
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None


# 搜索和分页模型
class HistorySearchRequest(BaseModel):
    keyword: Optional[str] = Field(None, description="搜索关键词")
    model: Optional[ModelType] = Field(None, description="模型筛选")
    status: Optional[GenerationStatus] = Field(None, description="状态筛选")
    start_date: Optional[datetime] = Field(None, description="开始日期")
    end_date: Optional[datetime] = Field(None, description="结束日期")
    page: int = Field(1, ge=1, description="页码")
    page_size: int = Field(20, ge=1, le=100, description="每页数量")


class PaginatedResponse(BaseModel):
    """分页响应模型"""

    items: List[GenerationHistoryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# 统计模型
class ModelStats(BaseModel):
    model: str
    count: int
    latest_generation: Optional[datetime] = None


class ActivityStats(BaseModel):
    date: str
    count: int


class StatsResponse(BaseModel):
    """统计响应模型"""

    total_generations: int
    successful_generations: int
    failed_generations: int
    by_model: List[ModelStats]
    recent_activity: List[ActivityStats]
    timestamp: datetime


# 响应模型
class FullGenerationResponse(BaseModel):
    """完整生成的响应模型"""

    id: str
    question: str
    model: str
    content: Dict[str, Any]  # PhysicsContent
    animation: Dict[str, Any]  # SVGGeneration
    created_at: datetime


class SuccessResponse(BaseModel):
    """通用成功响应"""

    message: str
    data: Optional[Dict[str, Any]] = None
