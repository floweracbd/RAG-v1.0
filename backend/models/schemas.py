 #创建pydantic的类来验证输入的数据
from pydantic import BaseModel , Field
from typing import List, Optional
#顾客输入的信息校验
class ChatRouter(BaseModel):
    question : str = Field(description="用户输入的问题")
    thread_id : str = Field(description="用户的唯一会话id，用户保存记忆")

#大模型最终的输出校验
class ChatResponse(BaseModel):
    reply : str = Field(description="大模型最终的文本回复")


#入库回执单
class UploadResponse(BaseModel):
    id : int = Field(description="数据库存入文件对应的id")
    status : str = Field(description="上传的状态，比如success 或 error")
    filename : str = Field(description="上传的原始文件名")
    message : str = Field(description="底层处理结果详情（如入库成功信息）")
    file_size : int = Field(description="文件大小(字节数)")

class SaveDatabase(BaseModel):
    status : str = Field(description="存入的状态，比如success 或 error")

# --- 文档专柜用的单据 ---
class DocumentItem(BaseModel):
    id: int
    file_name: str
    file_type: str
    file_md5: str

class DocumentListResponse(BaseModel):
    total: int
    documents: List[DocumentItem]

class BaseResponse(BaseModel):
    status: str
    message: str


# --- 会话专柜用的单据 ---
class MessageItem(BaseModel):
    role: str = Field(description="human 或 ai")
    content: str

class SessionHistoryResponse(BaseModel):
    session_id: str
    messages: List[MessageItem]