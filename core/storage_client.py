import hashlib
import uuid
from typing import Any, Dict, Union

from chainlit.data.storage_clients.base import BaseStorageClient
from chainlit.logger import logger
from sqlalchemy import JSON, Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

try:
    from qiniu import Auth, BucketManager, put_data
except ImportError:
    raise ImportError("qiniu package is required. Install it with: pip install qiniu")


class QiniuStorageClient(BaseStorageClient):
    """
    Class to enable Qiniu Cloud Storage provider
    """

    def __init__(
        self,
        bucket: str,
        access_key: str,
        secret_key: str,
        domain: str,
    ):
        """
        Initialize Qiniu Storage Client

        Args:
            bucket: Qiniu bucket name
            access_key: Qiniu access key
            secret_key: Qiniu secret key
            domain: CDN domain for accessing files (e.g., 'your-bucket.qiniucdn.com')
        """
        try:
            self.bucket = bucket
            self.domain = domain.rstrip("/")  # Remove trailing slash if present
            self.access_key = access_key
            self.secret_key = secret_key

            # Initialize Qiniu Auth
            self.auth = Auth(access_key, secret_key)

            # Initialize bucket manager to verify connection
            self.bucket_manager = BucketManager(self.auth)

            # Test connection by getting bucket info
            ret, info = self.bucket_manager.stat(self.bucket, "test-connection")
            if (
                info.status_code == 612
            ):  # File not found is expected, means bucket exists
                logger.info(f"Successfully connected to Qiniu bucket: {self.bucket}")
            elif info.status_code == 631:  # Bucket does not exist
                logger.warning(
                    f"Bucket '{self.bucket}' does not exist or access denied"
                )
            else:
                logger.info(f"Connected to Qiniu, bucket status: {info.status_code}")

            logger.info("QiniuStorageClient initialized")
        except Exception as e:
            logger.warning(f"QiniuStorageClient initialization error: {e}")

    async def upload_file(
        self,
        object_key: str,
        data: Union[bytes, str],
        mime: str = "application/octet-stream",
        overwrite: bool = True,
    ) -> Dict[str, Any]:
        """
        Upload file to Qiniu Cloud Storage

        Args:
            object_key: File key/name in the bucket
            data: File data as bytes or string
            mime: MIME type of the file
            overwrite: Whether to overwrite existing file
            content_md5: Calculate and verify MD5 (not used in Qiniu, kept for compatibility)

        Returns:
            Dictionary with object_key and url, or empty dict on error
        """
        try:
            # Convert string to bytes if necessary
            if isinstance(data, str):
                data = data.encode("utf-8")

            # Generate upload token
            # If overwrite is False, use insertOnly policy
            policy = {}
            if not overwrite:
                policy["insertOnly"] = 1

            upload_token = self.auth.upload_token(self.bucket, object_key, 3600, policy)

            # Upload file
            ret, info = put_data(
                upload_token,
                object_key,
                data,
                mime_type=mime,
            )

            if info.status_code == 200:
                # Construct URL using the provided domain
                url = f"https://{self.domain}/{object_key}"
                logger.info(f"Successfully uploaded file: {object_key}")
                return {
                    "object_key": object_key,
                    "url": url,
                    "hash": ret.get("hash") if ret else None,
                    "key": ret.get("key") if ret else object_key,
                }
            else:
                logger.warning(f"Upload failed with status {info.status_code}: {info}")
                return {}

        except Exception as e:
            logger.warning(f"QiniuStorageClient, upload_file error: {e}")
            return {}

    async def delete_file(self, object_key: str) -> bool:
        """
        Delete file from Qiniu Cloud Storage

        Args:
            object_key: File key/name in the bucket

        Returns:
            True if successful, False otherwise
        """
        try:
            ret, info = self.bucket_manager.delete(self.bucket, object_key)

            if info.status_code == 200:
                logger.info(f"Successfully deleted file: {object_key}")
                return True
            else:
                logger.warning(f"Delete failed with status {info.status_code}: {info}")
                return False

        except Exception as e:
            logger.warning(f"QiniuStorageClient, delete_file error: {e}")
            return False

    async def get_read_url(self, object_key: str) -> str:
        """
        Get a read URL for the file in Qiniu Cloud Storage

        Args:
            object_key: File key/name in the bucket

        Returns:
            URL string for reading the file
        """
        try:
            # For public buckets, return direct URL
            base_url = f"https://{self.domain}/{object_key}"

            # For private buckets, generate a signed URL (expires in 1 hour)
            # You can adjust the expiration time as needed
            private_url = self.auth.private_download_url(base_url, expires=3600)

            return private_url

        except Exception as e:
            logger.warning(f"QiniuStorageClient, get_read_url error: {e}")
            return ""


Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    identifier = Column(String, nullable=False, unique=True)
    metadata_ = Column("metadata", JSONB, nullable=False)
    createdAt = Column(String)


class Thread(Base):
    __tablename__ = "threads"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    createdAt = Column(String)
    name = Column(String)
    userId = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    userIdentifier = Column(String)
    tags = Column(ARRAY(String))
    metadata_ = Column("metadata", JSONB)

    user = relationship("User", backref="threads")


class Step(Base):
    __tablename__ = "steps"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    threadId = Column(PG_UUID(as_uuid=True), ForeignKey("threads.id"), nullable=False)
    parentId = Column(PG_UUID(as_uuid=True))
    disableFeedback = Column(Boolean, nullable=True)
    streaming = Column(Boolean, nullable=False)
    waitForAnswer = Column(Boolean)
    isError = Column(Boolean)
    metadata_ = Column("metadata", JSONB)
    tags = Column(ARRAY(String))
    input = Column(Text)
    output = Column(Text)
    createdAt = Column(String)
    start = Column(String)
    end = Column(String)
    generation = Column(JSONB)
    showInput = Column(Text)
    language = Column(String)
    indent = Column(Integer)
    defaultOpen = Column(Boolean)


class Element(Base):
    __tablename__ = "elements"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    threadId = Column(PG_UUID(as_uuid=True), ForeignKey("threads.id"))
    type = Column(String)
    url = Column(String)
    chainlitKey = Column(String)
    name = Column(String, nullable=False)
    display = Column(String)
    objectKey = Column(String)
    size = Column(String)
    page = Column(Integer)
    language = Column(String)
    forId = Column(PG_UUID(as_uuid=True))
    mime = Column(String)
    props = Column(JSONB)


class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    forId = Column(PG_UUID(as_uuid=True), nullable=False)
    threadId = Column(PG_UUID(as_uuid=True), ForeignKey("threads.id"), nullable=False)
    value = Column(Integer, nullable=False)
    comment = Column(Text)

    thread = relationship("Thread", backref="feedbacks")


class LangGraph(Base):
    __tablename__ = "langgraphs"
    thread_id = Column(String, primary_key=True)
    state = Column(JSON, nullable=False)
    workflow = Column(String, nullable=False)
