#记忆查询接口

from fastapi import APIRouter, HTTPException
from backend.models.schemas import SessionHistoryResponse
from backend.services.agent_service import AgentService
router = APIRouter()

@router.post("/history/{thread_id}" , response_model=SessionHistoryResponse)
def history_router(thread_id):
    chat_agent = AgentService()
    try:
        cooked_messages = chat_agent.get_chat_history(thread_id)
        return SessionHistoryResponse(
            session_id=thread_id,
            messages=cooked_messages
        )
    except Exception as e:
        raise HTTPException(status_code=500 , detail=f"查询失败{str(e)}")
