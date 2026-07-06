from fastapi import FastAPI

from backend.api import chat_router , upload_router , document_router , session_router

app = FastAPI(
    title="电商 RAG 智能客服系统 API (V1.0 MVP版)",
    description="前后端分离架构：整合现有的文件流上传入库与 LangGraph 持久化记忆智能对话接口",
    version="1.0.0"
)

app.include_router(
    upload_router.router,
    prefix="/upload",
    tags=["📁 知识库文件上传专柜"]
)

app.include_router(
    chat_router.router, 
    prefix="/chat", 
    tags=["💬 智能客服问答专柜"]
)

app.include_router(
    document_router.router,
    prefix="/list",
    tags=["查询上传文件的信息"]
)

app.include_router(
    session_router.router,
    prefix="/history",
    tags=["查询用户记忆"]
)


@app.get("/" , tags=["🏠 大门迎宾前台"])
def read_root():
    return {
        "status": "success", 
        "message": "欢迎光临电商 RAG 智能客服系统！后端 API 服务已正常通电运转！"
    }