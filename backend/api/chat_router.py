#问答接口

from fastapi import APIRouter , HTTPException
from backend.models.schemas import ChatResponse , ChatRouter
from backend.services.agent_service import AgentService

router = APIRouter()

agent_svc = AgentService()

@router.post("/" , response_model=ChatResponse)
async def chat_endpoint(request : ChatRouter):
    """
    智能问答客服接口
    """
    try:
        final_answer = agent_svc.rag_agent(request.question , request.thread_id)
        return ChatResponse(reply = final_answer)
    except Exception as e:
        raise HTTPException(status_code=500 , detail=str(e))
