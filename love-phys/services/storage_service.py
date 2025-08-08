# services/storage_service.py
import logging
import os
import uuid
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from qiniu import Auth, put_file

load_dotenv()

logger = logging.getLogger(__name__)


class QiniuStorageService:
    def __init__(self):
        # 从环境变量获取七牛云配置
        self.access_key = os.getenv("QINIU_ACCESS_KEY")
        self.secret_key = os.getenv("QINIU_SECRET_KEY")
        self.bucket_name = os.getenv("QINIU_BUCKET_NAME")
        self.domain = os.getenv("QINIU_DOMAIN")

        # 验证必要的配置
        if not all([self.access_key, self.secret_key, self.bucket_name, self.domain]):
            missing = []
            if not self.access_key:
                missing.append("QINIU_ACCESS_KEY")
            if not self.secret_key:
                missing.append("QINIU_SECRET_KEY")
            if not self.bucket_name:
                missing.append("QINIU_BUCKET_NAME")
            if not self.domain:
                missing.append("QINIU_DOMAIN")

            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}"
            )

        # 创建七牛云认证对象
        self.auth = Auth(self.access_key, self.secret_key)

        # 确保domain以http://或https://开头
        if not self.domain.startswith(("http://", "https://")):
            self.domain = f"https://{self.domain}"

        # 确保domain不以/结尾
        self.domain = self.domain.rstrip("/")

    def generate_audio_key(self, history_id: str, file_extension: str = "wav") -> str:
        """
        生成音频文件的存储键名

        Args:
            history_id: 历史记录ID
            file_extension: 文件扩展名

        Returns:
            str: 存储键名
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]

        # 格式: audio/physics/{year}/{month}/history_id_timestamp_uniqueid.wav
        year_month = datetime.now().strftime("%Y/%m")
        key = f"audio/physics/{year_month}/{history_id}_{timestamp}_{unique_id}.{file_extension}"

        return key

    async def upload_audio_file(self, file_path: str, history_id: str) -> str:
        """
        上传音频文件到七牛云

        Args:
            file_path: 本地文件路径
            history_id: 历史记录ID

        Returns:
            str: 文件的CDN访问URL

        Raises:
            Exception: 上传失败
        """
        try:
            # 验证文件是否存在
            if not os.path.exists(file_path):
                raise Exception(f"文件不存在: {file_path}")

            # 获取文件大小
            file_size = os.path.getsize(file_path)
            logger.info(f"准备上传音频文件: {file_path}, 大小: {file_size} bytes")

            # 生成存储键名
            file_extension = os.path.splitext(file_path)[1].lstrip(".")
            key = self.generate_audio_key(history_id, file_extension)

            # 生成上传凭证
            token = self.auth.upload_token(self.bucket_name, key, 3600)  # 1小时有效期

            # 上传文件
            ret, info = put_file(token, key, file_path)

            # 检查上传结果
            if info.status_code != 200:
                error_msg = f"上传失败，状态码: {info.status_code}"
                if hasattr(info, "text_body"):
                    error_msg += f", 错误信息: {info.text_body}"
                raise Exception(error_msg)

            if not ret or "key" not in ret:
                raise Exception("上传返回结果异常")

            # 生成访问URL
            file_url = f"{self.domain}/{key}"

            logger.info(f"音频文件上传成功: {key}, URL: {file_url}")

            return file_url

        except Exception as e:
            logger.error(f"音频文件上传失败: {e}")
            raise Exception(f"音频文件上传失败: {str(e)}")

    async def delete_audio_file(self, file_url: str) -> bool:
        """
        删除七牛云上的音频文件

        Args:
            file_url: 文件的CDN访问URL

        Returns:
            bool: 是否删除成功
        """
        try:
            # 从URL提取key
            key = self._extract_key_from_url(file_url)
            if not key:
                logger.warning(f"无法从URL提取key: {file_url}")
                return False

            # 创建删除管理器
            from qiniu import BucketManager

            bucket_manager = BucketManager(self.auth)

            # 删除文件
            ret, info = bucket_manager.delete(self.bucket_name, key)

            if info.status_code == 200:
                logger.info(f"音频文件删除成功: {key}")
                return True
            elif info.status_code == 612:  # 文件不存在
                logger.info(f"音频文件不存在: {key}")
                return True
            else:
                logger.error(f"音频文件删除失败: {key}, 状态码: {info.status_code}")
                return False

        except Exception as e:
            logger.error(f"删除音频文件时发生异常: {e}")
            return False

    def _extract_key_from_url(self, file_url: str) -> Optional[str]:
        """
        从CDN URL中提取存储键名

        Args:
            file_url: CDN访问URL

        Returns:
            Optional[str]: 存储键名，如果提取失败返回None
        """
        try:
            # 移除domain部分
            if file_url.startswith(self.domain):
                key = file_url[len(self.domain) :].lstrip("/")
                return key
            else:
                # 如果URL不是我们的域名，尝试提取路径部分
                from urllib.parse import urlparse

                parsed = urlparse(file_url)
                return parsed.path.lstrip("/")
        except Exception as e:
            logger.error(f"提取key失败: {e}")
            return None

    def get_file_info(self, file_url: str) -> Optional[dict]:
        """
        获取文件信息

        Args:
            file_url: 文件URL

        Returns:
            Optional[dict]: 文件信息，包含大小、类型等
        """
        try:
            key = self._extract_key_from_url(file_url)
            if not key:
                return None

            from qiniu import BucketManager

            bucket_manager = BucketManager(self.auth)

            ret, info = bucket_manager.stat(self.bucket_name, key)

            if info.status_code == 200 and ret:
                return {
                    "key": key,
                    "size": ret.get("fsize", 0),
                    "mime_type": ret.get("mimeType", ""),
                    "put_time": ret.get("putTime", 0),
                    "md5": ret.get("md5", ""),
                }

            return None

        except Exception as e:
            logger.error(f"获取文件信息失败: {e}")
            return None

    def validate_config(self) -> tuple[bool, str]:
        """
        验证七牛云配置是否正确

        Returns:
            tuple: (是否有效, 错误信息)
        """
        try:
            # 测试认证是否有效
            from qiniu import BucketManager

            bucket_manager = BucketManager(self.auth)

            # 尝试列举存储空间（只获取1个文件，减少开销）
            ret, eof, info = bucket_manager.list(self.bucket_name, limit=1)

            if info.status_code == 200:
                return True, "配置验证成功"
            else:
                return False, f"配置验证失败，状态码: {info.status_code}"

        except Exception as e:
            return False, f"配置验证失败: {str(e)}"
