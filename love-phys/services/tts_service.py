# services/tts_service.py
import json
import logging
import os
import tempfile
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class TTSService:
    def __init__(self):
        self.api_key = os.getenv("DASHSCOPE_API_KEY")
        if not self.api_key:
            raise ValueError("DASHSCOPE_API_KEY environment variable is required")

        # TTS配置
        self.api_url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
        self.model = "qwen-tts"
        self.voice = "Cherry"  # 可配置的声音类型

    async def generate_audio(self, text: str, voice: Optional[str] = None) -> str:
        """
        生成音频并返回本地临时文件路径

        Args:
            text: 要转换的文本
            voice: 声音类型，默认使用配置的声音

        Returns:
            str: 本地临时文件路径

        Raises:
            Exception: TTS调用失败或音频下载失败
        """
        try:
            # 使用指定的声音或默认声音
            selected_voice = voice or self.voice

            logger.info(f"开始TTS生成，文本长度: {len(text)}, 声音: {selected_voice}")

            # 构建请求头
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            # 构建请求数据
            payload = {
                "model": self.model,
                "input": {"text": text, "voice": selected_voice},
            }

            # 调用DashScope TTS API
            response = requests.post(
                self.api_url, headers=headers, json=payload, timeout=60  # 60秒超时
            )

            # 检查HTTP状态码
            response.raise_for_status()

            # 解析响应
            response_data = response.json()

            # 检查API响应状态
            if "output" not in response_data:
                error_msg = response_data.get("message", "API响应格式异常")
                raise Exception(f"TTS API响应异常：{error_msg}")

            output_data = response_data["output"]
            if "audio" not in output_data:
                raise Exception("TTS API响应异常：没有audio字段")

            audio_url = output_data["audio"].get("url")
            if not audio_url:
                raise Exception("TTS API响应异常：没有音频URL")

            logger.info(f"TTS生成成功，音频URL: {audio_url}")

            # 下载音频文件到临时路径
            temp_file_path = await self._download_audio(audio_url)

            return temp_file_path

        except requests.exceptions.RequestException as e:
            logger.error(f"TTS API请求失败: {e}")
            raise Exception(f"TTS API请求失败: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"TTS API响应解析失败: {e}")
            raise Exception(f"TTS API响应解析失败: {str(e)}")
        except Exception as e:
            logger.error(f"TTS生成失败: {e}")
            raise Exception(f"TTS生成失败: {str(e)}")

    async def _download_audio(self, audio_url: str) -> str:
        """
        下载音频文件到临时路径

        Args:
            audio_url: 音频文件URL

        Returns:
            str: 本地临时文件路径
        """
        try:
            logger.info(f"开始下载音频文件: {audio_url}")

            # 创建临时文件
            temp_fd, temp_path = tempfile.mkstemp(suffix=".wav", prefix="tts_audio_")

            # 下载音频文件
            response = requests.get(audio_url, timeout=30)
            response.raise_for_status()

            # 写入临时文件
            with os.fdopen(temp_fd, "wb") as temp_file:
                temp_file.write(response.content)

            logger.info(
                f"音频文件下载成功: {temp_path}, 大小: {len(response.content)} bytes"
            )

            return temp_path

        except requests.RequestException as e:
            logger.error(f"音频下载失败: {e}")
            raise Exception(f"音频下载失败: {str(e)}")
        except Exception as e:
            logger.error(f"音频文件处理失败: {e}")
            # 清理可能创建的临时文件
            try:
                if "temp_path" in locals():
                    os.unlink(temp_path)
            except:
                pass
            raise Exception(f"音频文件处理失败: {str(e)}")

    def cleanup_temp_file(self, file_path: str):
        """
        清理临时文件

        Args:
            file_path: 要清理的文件路径
        """
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                logger.info(f"临时文件清理成功: {file_path}")
        except Exception as e:
            logger.warning(f"临时文件清理失败: {file_path}, 错误: {e}")

    def get_available_voices(self) -> list:
        """
        获取可用的声音类型列表

        Returns:
            list: 可用的声音类型
        """
        return [
            "Chelsie",  # 女
            "Cherry",  # 甜美-女
            "Ethan",  # 男
            "Serena",  # 女
            "Dylan",  # 京腔-男
            "Jada",  # 吴语-女
            "Sunny",  # 川-女
        ]

    def validate_text(self, text: str) -> tuple[bool, str]:
        """
        验证文本是否适合TTS转换

        Args:
            text: 要验证的文本

        Returns:
            tuple: (是否有效, 错误信息)
        """
        if not text or not text.strip():
            return False, "文本不能为空"

        # 检查文本长度
        if len(text) > 1000:  # DashScope的长度限制
            return False, "文本长度不能超过1000个字符"

        # 检查文本内容
        if text.strip() == "":
            return False, "文本内容为空"

        return True, ""
