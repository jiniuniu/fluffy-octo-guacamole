# services/generation_service.py
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from core.chains import (
    PhysicsContent,
    SVGGeneration,
    SVGModification,
    create_content_chain,
    create_svg_chain,
    create_svg_modify_chain,
)
from core.llm import get_llm
from db.models import GenerationStatus
from services.history_service import HistoryService
from services.storage_service import QiniuStorageService
from services.tts_service import TTSService

logger = logging.getLogger(__name__)


class GenerationService:
    def __init__(self, history_service: HistoryService):
        self.history_service = history_service

        # 初始化TTS和存储服务
        self.tts_service = None
        self.storage_service = None
        self._init_services()

    def _init_services(self):
        """初始化TTS和存储服务"""
        try:
            self.tts_service = TTSService()
            logger.info("TTS服务初始化成功")
        except Exception as e:
            logger.warning(f"TTS服务初始化失败: {e}")
            self.tts_service = None

        try:
            self.storage_service = QiniuStorageService()
            # 验证七牛云配置
            is_valid, error_msg = self.storage_service.validate_config()
            if is_valid:
                logger.info("七牛云存储服务初始化成功")
            else:
                logger.warning(f"七牛云存储配置无效: {error_msg}")
                self.storage_service = None
        except Exception as e:
            logger.warning(f"七牛云存储服务初始化失败: {e}")
            self.storage_service = None

    def get_chain(self, model: str, chain_type: str, svg_type: str = "dynamic"):
        """获取或创建指定类型的chain - 每次都创建新实例"""
        logger.info(f"创建新的chain: {model}-{chain_type}-{svg_type}")
        llm = get_llm(model=model)

        if chain_type == "content":
            return create_content_chain(llm)
        elif chain_type == "svg":
            return create_svg_chain(llm, svg_type=svg_type)
        elif chain_type == "svg_modify":
            return create_svg_modify_chain(llm)
        else:
            raise ValueError(f"未知的chain类型: {chain_type}")

    async def generate_full_with_history(
        self,
        question: str,
        model: str,
        svg_type: str = "dynamic",
        enable_tts: bool = True,
        voice_type: str = "Cherry",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Tuple[
        PhysicsContent, SVGGeneration, str, Optional[str], Optional[Dict[str, Any]]
    ]:
        """生成完整内容并保存到历史记录，包含音频"""
        history_record = None
        audio_url = None
        audio_metadata = None

        try:
            # 1. 创建pending记录
            logger.info(f"创建pending记录: {question[:50]}...")
            if metadata is None:
                metadata = {}
            metadata["svg_type"] = svg_type

            history_record = await self.history_service.create_pending_record(
                question=question, model=model, metadata=metadata
            )
            history_id = history_record.id

            # 2. 获取chains
            content_chain = self.get_chain(model, "content")
            svg_chain = self.get_chain(model, "svg", svg_type=svg_type)

            # 3. 生成物理内容
            logger.info(f"生成物理内容: {history_id}")
            physics_content: PhysicsContent = await content_chain.ainvoke(
                {"question": question}
            )

            # 4. 生成SVG动画
            logger.info(f"生成SVG动画: {history_id}")
            svg_result: SVGGeneration = await svg_chain.ainvoke(
                {"question": question, "explanation": physics_content.explanation}
            )

            # 5. 生成音频（如果启用）
            if enable_tts and self._can_generate_audio():
                try:
                    logger.info(f"生成音频: {history_id}")
                    audio_url, audio_metadata = (
                        await self._generate_audio_with_proper_key(
                            physics_content.explanation, voice_type, history_id
                        )
                    )
                    logger.info(f"音频生成成功: {history_id}")
                except Exception as audio_error:
                    logger.error(f"音频生成失败，但不影响主流程: {audio_error}")
                    # 音频生成失败不影响主流程
                    audio_url = None
                    audio_metadata = None

            # 6. 更新为成功状态
            await self.history_service.update_record(
                history_id=history_id,
                explanation=physics_content.explanation,
                svg_code=svg_result.svgCode,
                status=GenerationStatus.SUCCESS,
                audio_url=audio_url,
                audio_metadata=audio_metadata,
            )

            logger.info(
                f"完整生成成功: {history_id}, 包含音频: {audio_url is not None}"
            )
            return physics_content, svg_result, history_id, audio_url, audio_metadata

        except Exception as e:
            logger.error(f"完整生成失败: {e}")

            # 更新为失败状态
            if history_record:
                try:
                    await self.history_service.update_record(
                        history_id=history_record.id,
                        status=GenerationStatus.FAILED,
                        error_message=str(e),
                    )
                except Exception as update_error:
                    logger.error(f"更新失败状态失败: {update_error}")

            # 如果音频已上传，尝试清理
            if audio_url and self.storage_service:
                try:
                    await self.storage_service.delete_audio_file(audio_url)
                    logger.info(f"清理失败记录的音频文件: {audio_url}")
                except Exception as cleanup_error:
                    logger.error(f"清理音频文件失败: {cleanup_error}")

            raise

    async def _generate_audio_with_proper_key(
        self, text: str, voice_type: str, history_id: str
    ) -> Tuple[str, Dict[str, Any]]:
        """使用正确的history_id生成并上传音频"""
        temp_file_path = None
        try:
            # 1. 验证文本
            is_valid, error_msg = self.tts_service.validate_text(text)
            if not is_valid:
                raise Exception(f"文本验证失败: {error_msg}")

            # 2. 生成音频
            temp_file_path = await self.tts_service.generate_audio(text, voice_type)

            # 3. 使用正确的history_id上传
            audio_url = await self.storage_service.upload_audio_file(
                temp_file_path, history_id
            )

            # 4. 获取文件信息
            file_info = self.storage_service.get_file_info(audio_url)

            # 5. 构建音频元数据
            audio_metadata = {
                "voice_type": voice_type,
                "text_length": len(text),
                "file_size": file_info.get("size", 0) if file_info else 0,
                "mime_type": (
                    file_info.get("mime_type", "audio/wav")
                    if file_info
                    else "audio/wav"
                ),
                "generated_at": datetime.now().isoformat(),
            }

            return audio_url, audio_metadata

        finally:
            # 清理临时文件
            if temp_file_path:
                self.tts_service.cleanup_temp_file(temp_file_path)

    def _can_generate_audio(self) -> bool:
        """检查是否具备音频生成能力"""
        return self.tts_service is not None and self.storage_service is not None

    def get_cache_info(self) -> Dict[str, Any]:
        """获取服务状态信息"""
        # 只保留服务状态信息
        service_status = {
            "tts_available": self.tts_service is not None,
            "storage_available": self.storage_service is not None,
            "audio_generation_available": self._can_generate_audio(),
        }

        return {
            "service_status": service_status,
        }

    async def modify_svg(
        self, history_id: str, feedback: str, model: str = "claude"
    ) -> SVGModification:
        """修改SVG并更新记录"""
        try:
            logger.info(f"开始修改SVG: {history_id}, 反馈: {feedback[:50]}...")

            # 1. 获取原记录
            record = await self.history_service.get_by_id(history_id)
            if not record:
                raise ValueError(f"历史记录不存在: {history_id}")

            if record.status != GenerationStatus.SUCCESS:
                raise ValueError("只能修改成功生成的记录")

            # 2. 构建修改上下文
            recent_modifications_text = self._build_modifications_text(
                record.modification_history
            )

            # 3. 获取或创建修改chain
            modify_chain = self.get_chain(model, "svg_modify")

            # 4. 调用修改chain
            result: SVGModification = await modify_chain.ainvoke(
                {
                    "question": record.question,
                    "explanation": record.explanation,
                    "current_svg": record.svg_code,
                    "user_feedback": feedback,
                    "recent_modifications_text": recent_modifications_text,
                }
            )

            # 5. 更新记录
            await self.history_service.update_with_modification(
                history_id=history_id,
                new_svg=result.svgCode,
                feedback=feedback,
                model=model,
            )

            logger.info(f"SVG修改成功: {history_id}")
            return result

        except ValueError:
            # 业务异常直接抛出
            raise
        except Exception as e:
            logger.error(f"SVG修改失败: {e}")
            raise

    def _build_modifications_text(self, modification_history: List[Dict]) -> str:
        """构建修改历史文本"""
        if not modification_history:
            return "无修改历史"

        # 只显示最近3次修改，避免上下文过长
        recent = modification_history[-3:]

        texts = []
        for i, mod in enumerate(recent, 1):
            timestamp = mod.get("timestamp", "未知时间")
            feedback = mod.get("feedback", "")
            model = mod.get("model", "")

            texts.append(f"修改{i}({timestamp[:10]}): {feedback} [模型: {model}]")

        return "\n".join(texts)

    async def get_service_status(self) -> Dict[str, Any]:
        """获取服务状态信息"""
        status = {
            "tts_service": {
                "available": self.tts_service is not None,
                "voices": (
                    self.tts_service.get_available_voices() if self.tts_service else []
                ),
            },
            "storage_service": {
                "available": self.storage_service is not None,
            },
            "audio_generation": {
                "available": self._can_generate_audio(),
            },
        }

        # 如果存储服务可用，添加配置验证信息
        if self.storage_service:
            is_valid, error_msg = self.storage_service.validate_config()
            status["storage_service"]["config_valid"] = is_valid
            if not is_valid:
                status["storage_service"]["error"] = error_msg

        return status
