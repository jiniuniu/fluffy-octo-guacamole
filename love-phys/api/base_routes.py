# api/base_routes.py
import logging
from datetime import datetime
from typing import Optional

from db.database import get_database
from db.models import SuccessResponse
from fastapi import APIRouter, Depends, HTTPException, Query
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


@router.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now()}


@router.get("/cache/info")
async def get_cache_info(
    generation_service: GenerationService = Depends(get_generation_service),
):
    """获取缓存信息"""
    try:
        cache_info = generation_service.get_cache_info()
        return {"cache_info": cache_info, "timestamp": datetime.now()}
    except Exception as e:
        logger.error(f"获取缓存信息失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取缓存信息失败: {str(e)}")


@router.delete("/cache")
async def clear_cache(
    model: Optional[str] = Query(None, description="要清理的模型"),
    chain_type: Optional[str] = Query(None, description="要清理的chain类型"),
    generation_service: GenerationService = Depends(get_generation_service),
):
    """清理缓存"""
    try:
        generation_service.clear_cache(model=model, chain_type=chain_type)
        return SuccessResponse(
            message=f"缓存清理成功", data={"model": model, "chain_type": chain_type}
        )
    except Exception as e:
        logger.error(f"清理缓存失败: {e}")
        raise HTTPException(status_code=500, detail=f"清理缓存失败: {str(e)}")


@router.get("/service/status")
async def get_service_status(
    generation_service: GenerationService = Depends(get_generation_service),
):
    """获取服务状态信息"""
    try:
        status = await generation_service.get_service_status()
        return {"status": status, "timestamp": datetime.now()}
    except Exception as e:
        logger.error(f"获取服务状态失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取服务状态失败: {str(e)}")
