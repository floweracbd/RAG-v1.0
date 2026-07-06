#上传接口
from fastapi import APIRouter , HTTPException, UploadFile , File
from backend.models.schemas import UploadResponse , SaveDatabase
from backend.services.file_service import FileService

router = APIRouter()
file_service = FileService()

@router.post("/upload" , response_model=UploadResponse)
async def upload_router(file : UploadFile = File(...)):
    try:
        file_name = file.filename
        file_byte = await file.read()
        file_content_type = file.content_type
        result_message = file_service.save_file(file_name , file_byte , file_content_type)
        return UploadResponse(
            status="success",
            filename=file_name,
            message=result_message["messages"],
            file_size=len(file_byte),
            id=result_message["id"]
        )
    except Exception as e:
        print(f"❌ 上传路由崩了：{e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/save" , response_model=SaveDatabase)
async def save_datebase_router(document_id : int):
    try:
        response = file_service.save_dabatase(document_id)
        return SaveDatabase(status=response)
    except Exception as e:
        print(f"嵌入向量失败")
        raise HTTPException(status_code=500, detail=str(e))