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


class VoiceType(str, Enum):
    """TTS声音类型"""

    CHELSIE = "Chelsie"  # 女
    CHERRY = "Cherry"  # 甜美-女
    ETHAN = "Ethan"  # 男
    SERENA = "Serena"  # 女
    DYLAN = "Dylan"  # 京腔-男
    JADA = "Jada"  # 吴语-女
    SUNNY = "Sunny"  # 川-女


# 请求模型
class GenerateContentRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500, description="物理问题")
    model: ModelType = Field(ModelType.CLAUDE, description="使用的模型")
    enable_tts: bool = Field(True, description="是否启用TTS语音合成")
    voice_type: VoiceType = Field(VoiceType.CHERRY, description="TTS声音类型")


class ModifySVGRequest(BaseModel):
    feedback: str = Field(
        ..., min_length=1, max_length=1000, description="用户对SVG的反馈"
    )
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
    # 音频相关字段
    audio_url: Optional[str] = None
    audio_metadata: Optional[Dict[str, Any]] = None


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

    modification_history: List[Dict[str, Any]] = Field(
        default_factory=list, description="修改历史记录"
    )

    # 音频相关字段
    audio_url: Optional[str] = Field(None, description="音频文件CDN访问URL")
    audio_metadata: Optional[Dict[str, Any]] = Field(
        None, description="音频元数据，包含声音类型、文件大小等信息"
    )


class GenerationHistoryResponse(BaseModel):
    """API响应的历史记录模型"""

    id: str
    question: str
    explanation: str
    svg_code: str
    model: str
    status: GenerationStatus
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None
    modification_history: List[Dict[str, Any]] = Field(default_factory=list)

    # 音频相关字段
    audio_url: Optional[str] = Field(None, description="音频文件访问URL")
    audio_metadata: Optional[Dict[str, Any]] = Field(None, description="音频元数据")


# 搜索和分页模型
class HistorySearchRequest(BaseModel):
    keyword: Optional[str] = Field(None, description="搜索关键词")
    model: Optional[ModelType] = Field(None, description="模型筛选")
    status: Optional[GenerationStatus] = Field(None, description="状态筛选")
    start_date: Optional[datetime] = Field(None, description="开始日期")
    end_date: Optional[datetime] = Field(None, description="结束日期")
    page: int = Field(1, ge=1, description="页码")
    page_size: int = Field(20, ge=1, le=100, description="每页数量")
    # 音频筛选
    has_audio: Optional[bool] = Field(None, description="是否包含音频")


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


class AudioStats(BaseModel):
    """音频统计模型"""

    total_audio_files: int
    total_audio_size: int  # 字节
    by_voice_type: List[Dict[str, Any]]


class StatsResponse(BaseModel):
    """统计响应模型"""

    total_generations: int
    successful_generations: int
    failed_generations: int
    by_model: List[ModelStats]
    recent_activity: List[ActivityStats]
    timestamp: datetime
    # 音频统计
    audio_stats: Optional[AudioStats] = None


# 响应模型
class FullGenerationResponse(BaseModel):
    """完整生成的响应模型"""

    id: str
    question: str
    model: str
    content: Dict[str, Any]  # PhysicsContent
    animation: Dict[str, Any]  # SVGGeneration
    created_at: datetime
    # 音频相关字段
    audio: Optional[Dict[str, Any]] = Field(None, description="音频信息")


class SuccessResponse(BaseModel):
    """通用成功响应"""

    message: str
    data: Optional[Dict[str, Any]] = None
