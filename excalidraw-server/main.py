from chain import generate_graph_sync
from config import settings
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import GraphInput
from pydantic import BaseModel, Field

# --- FastAPI ---
app = FastAPI(title="excalidraw llm app api", version="0.1.0")

# CORS（按需放宽，方便本地前端直连）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发期可放开，生产请收紧
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenReq(BaseModel):
    prompt: str = Field(..., description="用户的自然语言需求")
    rankdir: str = Field("LR", description="LR 或 TB")


@app.get("/info")
def info():
    return {"model": settings.llm_model}


@app.post("/generate")
def generate(req: GenReq) -> dict:
    try:
        graph: GraphInput = generate_graph_sync(req.prompt, req.rankdir)
        # 返回给前端：GraphInput（前端走 dagre + convert → excalidraw）
        return graph.model_dump(by_alias=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
