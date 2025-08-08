# services/history_service.py
import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from db.models import (
    ActivityStats,
    AudioStats,
    GenerationHistory,
    GenerationHistoryResponse,
    GenerationStatus,
    HistorySearchRequest,
    ModelStats,
    PaginatedResponse,
    StatsResponse,
)
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING

logger = logging.getLogger(__name__)


class HistoryService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.generation_history

    async def create_pending_record(
        self, question: str, model: str, metadata: Optional[Dict[str, Any]] = None
    ) -> GenerationHistory:
        """创建一个pending状态的记录"""
        try:
            now = datetime.now()
            history_data = {
                "id": str(uuid.uuid4()),
                "question": question,
                "explanation": "",
                "svg_code": "",
                "model": model,
                "status": GenerationStatus.PENDING,
                "error_message": None,
                "created_at": now,
                "updated_at": now,
                "metadata": metadata or {},
                "modification_history": [],
                "audio_url": None,
                "audio_metadata": {},
            }

            await self.collection.insert_one(history_data)
            logger.info(f"创建pending记录成功: {history_data['id']}")

            return GenerationHistory(**history_data)

        except Exception as e:
            logger.error(f"创建pending记录失败: {e}")
            raise

    async def get_by_id(self, history_id: str) -> Optional[GenerationHistory]:
        """根据ID获取历史记录"""
        try:
            result = await self.collection.find_one({"id": history_id})
            if result:
                result.pop("_id", None)
                # 确保字段存在
                if "modification_history" not in result:
                    result["modification_history"] = []
                if "audio_url" not in result:
                    result["audio_url"] = None
                if "audio_metadata" not in result:
                    result["audio_metadata"] = {}
                return GenerationHistory(**result)
            return None

        except Exception as e:
            logger.error(f"查询历史记录失败: {e}")
            raise

    async def search_history(
        self, search_request: HistorySearchRequest
    ) -> PaginatedResponse:
        """搜索历史记录"""
        try:
            # 构建查询条件
            query = {}

            # 关键词搜索
            if search_request.keyword:
                query["$or"] = [
                    {"question": {"$regex": search_request.keyword, "$options": "i"}},
                    {
                        "explanation": {
                            "$regex": search_request.keyword,
                            "$options": "i",
                        }
                    },
                ]

            # 模型筛选
            if search_request.model:
                query["model"] = search_request.model

            # 状态筛选
            if search_request.status:
                query["status"] = search_request.status

            # 音频筛选
            if search_request.has_audio is not None:
                if search_request.has_audio:
                    query["audio_url"] = {"$ne": None, "$exists": True}
                else:
                    query["$or"] = [
                        {"audio_url": None},
                        {"audio_url": {"$exists": False}},
                    ]

            # 日期范围筛选
            if search_request.start_date or search_request.end_date:
                date_query = {}
                if search_request.start_date:
                    date_query["$gte"] = search_request.start_date
                if search_request.end_date:
                    date_query["$lte"] = search_request.end_date
                query["created_at"] = date_query

            # 分页计算
            skip = (search_request.page - 1) * search_request.page_size
            limit = search_request.page_size

            # 查询总数和数据
            total = await self.collection.count_documents(query)
            cursor = (
                self.collection.find(query, {"_id": 0})
                .sort("created_at", DESCENDING)
                .skip(skip)
                .limit(limit)
            )
            results = await cursor.to_list(length=limit)

            # 转换为响应模型
            items = []
            for result in results:
                if "modification_history" not in result:
                    result["modification_history"] = []
                if "audio_url" not in result:
                    result["audio_url"] = None
                if "audio_metadata" not in result:
                    result["audio_metadata"] = {}
                items.append(GenerationHistoryResponse(**result))

            total_pages = (
                total + search_request.page_size - 1
            ) // search_request.page_size

            return PaginatedResponse(
                items=items,
                total=total,
                page=search_request.page,
                page_size=search_request.page_size,
                total_pages=total_pages,
            )

        except Exception as e:
            logger.error(f"搜索历史记录失败: {e}")
            raise

    async def get_recent_history(
        self, limit: int = 10
    ) -> List[GenerationHistoryResponse]:
        """获取最近的历史记录"""
        try:
            cursor = (
                self.collection.find({"status": GenerationStatus.SUCCESS}, {"_id": 0})
                .sort("created_at", DESCENDING)
                .limit(limit)
            )

            results = await cursor.to_list(length=limit)
            response_list = []
            for result in results:
                if "modification_history" not in result:
                    result["modification_history"] = []
                if "audio_url" not in result:
                    result["audio_url"] = None
                if "audio_metadata" not in result:
                    result["audio_metadata"] = {}
                response_list.append(GenerationHistoryResponse(**result))

            return response_list

        except Exception as e:
            logger.error(f"获取最近历史记录失败: {e}")
            raise

    async def delete_by_id(self, history_id: str, storage_service=None) -> bool:
        """删除历史记录和关联的音频文件"""
        try:
            # 获取记录信息，检查是否有音频文件
            record = await self.get_by_id(history_id)
            if not record:
                logger.warning(f"历史记录不存在: {history_id}")
                return False

            # 删除数据库记录
            result = await self.collection.delete_one({"id": history_id})
            if result.deleted_count == 0:
                logger.warning(f"数据库记录删除失败: {history_id}")
                return False

            # 删除关联的音频文件
            if record.audio_url and storage_service:
                try:
                    audio_deleted = await storage_service.delete_audio_file(
                        record.audio_url
                    )
                    if audio_deleted:
                        logger.info(f"音频文件删除成功: {record.audio_url}")
                    else:
                        logger.warning(f"音频文件删除失败: {record.audio_url}")
                except Exception as audio_error:
                    logger.error(f"删除音频文件时发生错误: {audio_error}")

            logger.info(f"删除历史记录成功: {history_id}")
            return True

        except Exception as e:
            logger.error(f"删除历史记录失败: {e}")
            raise

    async def update_record(
        self,
        history_id: str,
        explanation: Optional[str] = None,
        svg_code: Optional[str] = None,
        status: Optional[GenerationStatus] = None,
        error_message: Optional[str] = None,
        audio_url: Optional[str] = None,
        audio_metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """更新历史记录"""
        try:
            update_data = {"updated_at": datetime.now()}

            if explanation is not None:
                update_data["explanation"] = explanation
            if svg_code is not None:
                update_data["svg_code"] = svg_code
            if status is not None:
                update_data["status"] = status
            if error_message is not None:
                update_data["error_message"] = error_message
            if audio_url is not None:
                update_data["audio_url"] = audio_url
            if audio_metadata is not None:
                update_data["audio_metadata"] = audio_metadata

            result = await self.collection.update_one(
                {"id": history_id}, {"$set": update_data}
            )

            success = result.modified_count > 0
            if success:
                logger.info(f"更新历史记录成功: {history_id}")
            return success

        except Exception as e:
            logger.error(f"更新历史记录失败: {e}")
            raise

    async def update_with_modification(
        self, history_id: str, new_svg: str, feedback: str, model: str
    ) -> bool:
        """更新记录：覆盖SVG并添加修改历史"""
        try:
            now = datetime.now()
            modification_record = {
                "feedback": feedback,
                "timestamp": now.isoformat(),
                "model": model,
            }

            result = await self.collection.update_one(
                {"id": history_id},
                {
                    "$set": {"svg_code": new_svg, "updated_at": now},
                    "$push": {"modification_history": modification_record},
                },
            )

            success = result.modified_count > 0
            if success:
                logger.info(f"修改记录更新成功: {history_id}")
            else:
                logger.warning(f"修改记录未更新: {history_id}")

            return success

        except Exception as e:
            logger.error(f"更新修改记录失败: {e}")
            raise

    async def get_modification_count(self, history_id: str) -> int:
        """获取记录的修改次数"""
        try:
            result = await self.collection.find_one(
                {"id": history_id}, {"modification_history": 1}
            )

            if result and "modification_history" in result:
                return len(result["modification_history"])
            return 0

        except Exception as e:
            logger.error(f"获取修改次数失败: {e}")
            return 0

    async def get_stats(self) -> StatsResponse:
        """获取统计信息"""
        try:
            # 基础统计
            total = await self.collection.count_documents({})
            successful = await self.collection.count_documents(
                {"status": GenerationStatus.SUCCESS}
            )
            failed = await self.collection.count_documents(
                {"status": GenerationStatus.FAILED}
            )

            # 按模型统计
            model_pipeline = [
                {
                    "$group": {
                        "_id": "$model",
                        "count": {"$sum": 1},
                        "latest_generation": {"$max": "$created_at"},
                    }
                },
                {"$sort": {"count": -1}},
            ]

            model_results = await self.collection.aggregate(model_pipeline).to_list(
                length=None
            )
            by_model = []
            for item in model_results:
                by_model.append(
                    ModelStats(
                        model=item["_id"],
                        count=item["count"],
                        latest_generation=item.get("latest_generation"),
                    )
                )

            # 最近7天的活动统计
            seven_days_ago = datetime.now() - timedelta(days=7)
            activity_pipeline = [
                {"$match": {"created_at": {"$gte": seven_days_ago}}},
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$created_at",
                            }
                        },
                        "count": {"$sum": 1},
                    }
                },
                {"$sort": {"_id": -1}},
            ]

            activity_results = await self.collection.aggregate(
                activity_pipeline
            ).to_list(length=None)
            recent_activity = []
            for item in activity_results:
                recent_activity.append(
                    ActivityStats(date=item["_id"], count=item["count"])
                )

            # 音频统计
            audio_stats = await self._get_audio_stats()

            return StatsResponse(
                total_generations=total,
                successful_generations=successful,
                failed_generations=failed,
                by_model=by_model,
                recent_activity=recent_activity,
                timestamp=datetime.now(),
                audio_stats=audio_stats,
            )

        except Exception as e:
            logger.error(f"获取统计信息失败: {e}")
            raise

    async def _get_audio_stats(self) -> Optional[AudioStats]:
        """获取音频相关统计信息"""
        try:
            audio_count = await self.collection.count_documents(
                {"audio_url": {"$ne": None, "$exists": True}}
            )

            if audio_count == 0:
                return AudioStats(
                    total_audio_files=0, total_audio_size=0, by_voice_type=[]
                )

            # 按声音类型统计
            voice_pipeline = [
                {"$match": {"audio_url": {"$ne": None, "$exists": True}}},
                {
                    "$group": {
                        "_id": "$audio_metadata.voice_type",
                        "count": {"$sum": 1},
                        "total_size": {"$sum": "$audio_metadata.file_size"},
                    }
                },
                {"$sort": {"count": -1}},
            ]

            voice_results = await self.collection.aggregate(voice_pipeline).to_list(
                length=None
            )
            by_voice_type = []
            total_size = 0
            for item in voice_results:
                voice_type = item["_id"] or "unknown"
                count = item["count"]
                size = item["total_size"] or 0
                total_size += size

                by_voice_type.append(
                    {"voice_type": voice_type, "count": count, "total_size": size}
                )

            return AudioStats(
                total_audio_files=audio_count,
                total_audio_size=total_size,
                by_voice_type=by_voice_type,
            )

        except Exception as e:
            logger.error(f"获取音频统计失败: {e}")
            return None
