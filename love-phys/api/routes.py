# api/routes.py
from api import base_routes, generation_routes, history_routes
from fastapi import APIRouter

# 创建主路由器
router = APIRouter()

# 注册子路由
router.include_router(base_routes.router, tags=["基础服务"])
router.include_router(generation_routes.router, tags=["内容生成"])
router.include_router(history_routes.router, tags=["历史记录"])
