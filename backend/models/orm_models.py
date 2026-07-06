from datetime import datetime
from sqlalchemy import Column , DateTime , Integer , String
from backend.core.database import Base

#构建数据库中的表结构
class Documents(Base):
    __tablename__ = "documents"

    id = Column(Integer , primary_key=True , index=True)
    file_name = Column(String , nullable=False)
    file_path = Column(String , nullable=False)
    file_md5 = Column(String , nullable=False , unique=True , index=True)
    file_type = Column(String , nullable=False)
    status = Column(String , nullable=False , default="pending")
    created_at = Column(DateTime , default=datetime.utcnow)
