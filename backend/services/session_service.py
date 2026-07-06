import os
from dotenv import load_dotenv
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_community.storage import SQLStore
load_dotenv(override=True)


class SessionService:
    """
    负责提供全局唯一的 PostgreSQL 记忆存储器。
    第一版直接在这里初始化并自动建表。
    """

    _ctx = None
    _checkpointer = None
    _docstore = None
    def __init__(self):
        if SessionService._checkpointer is None:
            print("[SessionService] 开始初始化 PostgreSQL 记忆库...")

            db_url = os.getenv("DB_URL")
            if not db_url:
                raise ValueError("没有读取到 DB_URL，请检查 .env 文件")
            if SessionService._checkpointer is None:
            # 用官方推荐方式创建 checkpointer
                SessionService._ctx = PostgresSaver.from_conn_string(db_url)
                SessionService._checkpointer = SessionService._ctx.__enter__()

                # 第一次启动时自动建表
                SessionService._checkpointer.setup()
            
            if SessionService._docstore is None:
                # 极其简单粗暴，不需要什么 __enter__ 和 __exit__
                SessionService._docstore = SQLStore(namespace="parent_documents", db_url=db_url)
                SessionService._docstore.create_schema()
            print("[SessionService] PostgreSQL 记忆库初始化完成")

    def get_checkpointer(self):
        return SessionService._checkpointer
    
    def get_docstore(self):
        return SessionService._docstore