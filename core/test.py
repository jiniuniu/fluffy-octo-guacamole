import asyncio
import os
from datetime import datetime

from dotenv import load_dotenv

from core.storage_client import QiniuStorageClient

load_dotenv()


async def test_qiniu_storage_client():

    img_path = "data/girl_reading_book.png"
    mime_type = "image/png"

    qiniu_client = QiniuStorageClient(
        bucket=os.environ.get("QINIU_BUCKET"),
        access_key=os.environ.get("QINIU_AK"),
        secret_key=os.environ.get("QINIU_SK"),
        domain=os.environ.get("QINIU_DOMAIN"),
    )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_ext = os.path.splitext(img_path)[1]
    object_key = f"images_test/test_{timestamp}{file_ext}"
    with open(img_path, "rb") as f:
        image_data = f.read()

    result = await qiniu_client.upload_file(
        object_key=object_key,
        data=image_data,
        mime=mime_type,
    )
    print(result)
    print("*" * 40)
    url = await qiniu_client.get_read_url(object_key)
    print(url)


if __name__ == "__main__":
    asyncio.run(test_qiniu_storage_client())
