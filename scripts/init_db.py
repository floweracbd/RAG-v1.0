from backend.core.database import engine , Base
from backend.models.orm_models import Documents

#创建构造好的表
def init_db():
    Base.metadata.create_all(bind=engine)
    print("documents 表创建完成")

if __name__ == "__main__":
    init_db()