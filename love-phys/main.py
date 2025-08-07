# main.py
import logging
import os
import time
from contextlib import asynccontextmanager
from datetime import datetime

from api.base_routes import router
from db.database import close_mongo_connection, connect_to_mongo
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


# 生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时
    logger.info("正在启动应用...")
    try:
        await connect_to_mongo()
        logger.info("应用启动完成")
    except Exception as e:
        logger.error(f"应用启动失败: {e}")
        raise

    yield

    # 关闭时
    logger.info("正在关闭应用...")
    await close_mongo_connection()
    logger.info("应用关闭完成")


# 创建FastAPI应用
app = FastAPI(
    title="Physics Animation Generator API",
    description="生成物理解释和SVG动画的API服务",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS中间件配置
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        ["*"]
        if DEBUG
        else [
            "http://localhost:3000",
            "http://localhost:5173",
        ]
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # 记录请求开始
    logger.info(f"请求开始: {request.method} {request.url.path}")

    try:
        response: Response = await call_next(request)
        process_time = time.time() - start_time

        # 记录请求完成
        logger.info(
            f"请求完成: {request.method} {request.url.path} - "
            f"状态码: {response.status_code} - 耗时: {process_time:.3f}s"
        )

        # 添加处理时间到响应头
        response.headers["X-Process-Time"] = str(process_time)
        return response

    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            f"请求失败: {request.method} {request.url.path} - "
            f"错误: {str(e)} - 耗时: {process_time:.3f}s"
        )
        raise


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"未处理的异常: {request.method} {request.url.path} - {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "内部服务器错误",
            "message": "请稍后重试或联系管理员",
            "timestamp": datetime.now().isoformat(),
        },
    )


# 注册API路由
app.include_router(router, prefix="/api/v1", tags=["Physics Animation API"])


# 根路由
@app.get("/")
async def root():
    """API根路径"""
    return {
        "name": "Physics Animation Generator API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now(),
        "docs_url": "/docs",
        "api_prefix": "/api/v1",
    }


# 健康检查路由（全局）
@app.get("/health")
async def health_check():
    """全局健康检查"""
    try:
        from db.database import get_database

        # 检查数据库连接
        database = await get_database()
        await database.command("ping")

        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now(),
            "version": "1.0.0",
        }
    except Exception as e:
        logger.error(f"健康检查失败: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            },
        )


# API信息路由
@app.get("/api/info")
async def api_info():
    """API信息"""
    return {
        "title": "Physics Animation Generator API",
        "description": "生成物理解释和SVG动画的API服务",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
            "health": "/health",
            "api_v1": "/api/v1",
        },
        "features": [
            "物理内容生成",
            "SVG动画生成",
            "历史记录管理",
            "批量处理",
            "统计分析",
            "数据导出",
        ],
        "supported_models": ["claude", "qwen"],
        "timestamp": datetime.now(),
    }


if __name__ == "__main__":
    import uvicorn

    # 从环境变量获取配置
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    logger.info(f"启动服务器: {host}:{port}")
    logger.info(f"调试模式: {DEBUG}")

    uvicorn.run("main:app", host=host, port=port, reload=DEBUG, log_level="info")
