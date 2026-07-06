#负责数据库的连接与管理

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
DB_URL = os.getenv("DB_URL")

engine = create_engine(DB_URL , echo=False)
SessionLocal = sessionmaker(autocommit=False , autoflush=False , bind=engine)
Base = declarative_base()


