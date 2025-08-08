# api/history_routes.py
import logging
from datetime import datetime
from typing import Optional

from db.database import get_database
from db.models import (
    GenerationHistoryResponse,
    HistorySearchRequest,
    ModifySVGRequest,
    PaginatedResponse,
    StatsResponse,
    SuccessResponse,
)
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
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


# ============ 查询相关路由 ============


@router.post("/history/search", response_model=PaginatedResponse)
async def search_history(
    search_request: HistorySearchRequest,
    history_service: HistoryService = Depends(get_history_service),
):
    """搜索历史记录"""
    try:
        return await history_service.search_history(search_request)
    except Exception as e:
        logger.error(f"搜索历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")


@router.get("/history", response_model=PaginatedResponse)
async def get_history_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    model: Optional[str] = Query(None, description="模型筛选"),
    status: Optional[str] = Query(None, description="状态筛选"),
    has_audio: Optional[bool] = Query(None, description="是否包含音频"),
    history_service: HistoryService = Depends(get_history_service),
):
    """获取历史记录列表 (GET方式，便于前端调用)"""
    try:
        search_request = HistorySearchRequest(
            keyword=keyword,
            model=model,
            status=status,
            page=page,
            page_size=page_size,
            has_audio=has_audio,
        )
        return await history_service.search_history(search_request)
    except Exception as e:
        logger.error(f"获取历史记录列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取列表失败: {str(e)}")


@router.get("/history/recent")
async def get_recent_history(
    limit: int = Query(10, ge=1, le=50, description="返回数量"),
    history_service: HistoryService = Depends(get_history_service),
):
    """获取最近的历史记录"""
    try:
        results = await history_service.get_recent_history(limit)
        return {"items": results, "count": len(results), "timestamp": datetime.now()}
    except Exception as e:
        logger.error(f"获取最近历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取最近记录失败: {str(e)}")


@router.get("/history/{history_id}", response_model=GenerationHistoryResponse)
async def get_history_by_id(
    history_id: str, history_service: HistoryService = Depends(get_history_service)
):
    """根据ID获取历史记录"""
    try:
        result = await history_service.get_by_id(history_id)
        if not result:
            raise HTTPException(status_code=404, detail="历史记录未找到")

        return GenerationHistoryResponse(**result.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"查询历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")


# ============ 修改相关路由 ============


@router.post("/history/{history_id}/modify")
async def modify_svg(
    history_id: str,
    request: ModifySVGRequest,
    generation_service: GenerationService = Depends(get_generation_service),
):
    """修改SVG动画"""
    try:
        result = await generation_service.modify_svg(
            history_id=history_id, feedback=request.feedback, model=request.model
        )

        return {
            "message": "SVG修改成功",
            "svg_code": result.svgCode,
            "timestamp": datetime.now(),
        }

    except ValueError as e:
        # 业务异常返回400
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"SVG修改失败: {e}")
        raise HTTPException(status_code=500, detail=f"修改失败: {str(e)}")


@router.get("/history/{history_id}/modifications")
async def get_modification_history(
    history_id: str, history_service: HistoryService = Depends(get_history_service)
):
    """获取修改历史"""
    try:
        record = await history_service.get_by_id(history_id)
        if not record:
            raise HTTPException(status_code=404, detail="历史记录未找到")

        modification_count = await history_service.get_modification_count(history_id)

        return {
            "history_id": history_id,
            "modification_count": modification_count,
            "modification_history": record.modification_history,
            "last_modified": record.updated_at,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取修改历史失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取失败: {str(e)}")


# ============ 删除相关路由 ============


@router.delete("/history/{history_id}")
async def delete_history(
    history_id: str,
    history_service: HistoryService = Depends(get_history_service),
    generation_service: GenerationService = Depends(get_generation_service),
):
    """删除历史记录和关联的音频文件"""
    try:
        # 获取存储服务实例
        storage_service = generation_service.storage_service

        success = await history_service.delete_by_id(history_id, storage_service)
        if not success:
            raise HTTPException(status_code=404, detail="历史记录未找到")

        return SuccessResponse(message="历史记录已删除", data={"id": history_id})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")


# ============ 统计相关路由 ============


@router.get("/stats/summary", response_model=StatsResponse)
async def get_stats(history_service: HistoryService = Depends(get_history_service)):
    """获取统计信息"""
    try:
        return await history_service.get_stats()
    except Exception as e:
        logger.error(f"获取统计信息失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")


@router.get("/stats/models")
async def get_model_stats(
    history_service: HistoryService = Depends(get_history_service),
):
    """获取模型使用统计"""
    try:
        stats = await history_service.get_stats()
        return {"model_stats": stats.by_model, "timestamp": datetime.now()}
    except Exception as e:
        logger.error(f"获取模型统计失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取模型统计失败: {str(e)}")


# ============ 导出相关路由 ============


@router.get("/export/history/{history_id}/svg")
async def export_svg(
    history_id: str, history_service: HistoryService = Depends(get_history_service)
):
    """导出SVG文件"""
    try:
        result = await history_service.get_by_id(history_id)
        if not result:
            raise HTTPException(status_code=404, detail="历史记录未找到")

        if not result.svg_code:
            raise HTTPException(status_code=404, detail="该记录没有SVG内容")

        return Response(
            content=result.svg_code,
            media_type="image/svg+xml",
            headers={
                "Content-Disposition": f"attachment; filename=physics_animation_{history_id}.svg"
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"导出SVG失败: {e}")
        raise HTTPException(status_code=500, detail=f"导出失败: {str(e)}")


@router.get("/export/history/{history_id}/json")
async def export_json(
    history_id: str, history_service: HistoryService = Depends(get_history_service)
):
    """导出JSON格式的历史记录"""
    try:
        result = await history_service.get_by_id(history_id)
        if not result:
            raise HTTPException(status_code=404, detail="历史记录未找到")

        return Response(
            content=result.model_dump_json(indent=2),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=physics_record_{history_id}.json"
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"导出JSON失败: {e}")
        raise HTTPException(status_code=500, detail=f"导出失败: {str(e)}")
