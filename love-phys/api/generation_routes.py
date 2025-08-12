# api/generation_routes.py
import logging
from datetime import datetime

from db.database import get_database
from db.models import FullGenerationResponse, GenerateContentRequest
from fastapi import APIRouter, Depends, HTTPException
from services.generation_service import GenerationService
from services.history_service import HistoryService

logger = logging.getLogger(__name__)

router = APIRouter()


# 依赖注入函数
async def get_history_service(db=Depends(get_database)):
    return HistoryService(db)


async def get_generation_service(
    history_service: HistoryService = Depends(get_history_service),
):
    return GenerationService(history_service)


@router.post("/generate/full")
async def generate_full(
    request: GenerateContentRequest,
    generation_service: GenerationService = Depends(get_generation_service),
):
    """生成完整的物理解释、SVG动画和音频，并保存到历史记录"""
    try:
        physics_content, svg_result, history_id, audio_url, audio_metadata = (
            await generation_service.generate_full_with_history(
                question=request.question,
                model=request.model,
                svg_type=request.svg_type,
                enable_tts=request.enable_tts,
                voice_type=request.voice_type.value,
            )
        )

        # 构建音频信息
        audio_info = None
        if audio_url and audio_metadata:
            audio_info = {"url": audio_url, "metadata": audio_metadata}

        return FullGenerationResponse(
            id=history_id,
            question=request.question,
            model=request.model,
            content={"explanation": physics_content.explanation},
            animation={"svgCode": svg_result.svgCode},
            created_at=datetime.now(),
            audio=audio_info,
        )

    except Exception as e:
        logger.error(f"完整生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"完整生成失败: {str(e)}")
