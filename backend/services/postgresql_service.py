
from sqlalchemy.orm import Session
from backend.models.orm_models import Documents


class PostgresqlService:
    def __init__(self , session : Session):
        self.session = session
#查询文档中的文件信息
    def get_all_documents(self):
        # 查出所有的 Document 记录
        docs = self.session.query(Documents).all()
        return docs
