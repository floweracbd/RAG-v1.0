from fastapi import APIRouter, HTTPException , Depends
from backend.models.schemas import DocumentListResponse , DocumentItem
from backend.services.postgresql_service import PostgresqlService
from backend.core.database import SessionLocal
from sqlalchemy.orm import Session
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/list" , response_model=DocumentListResponse)
def get_all_documents(db : Session = Depends(get_db)):
    try:
        docs = PostgresqlService(session=db).get_all_documents()
        safe_items = []
        for raw in docs:
            item = DocumentItem(
                id=raw.id,
                file_name=raw.file_name,
                file_type=raw.file_type,
                file_md5=raw.file_md5
            )

            safe_items.append(item)

        return DocumentListResponse(
            total=len(safe_items),
            documents=safe_items
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")
    

