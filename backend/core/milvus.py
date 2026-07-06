

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_milvus import Milvus
from openai import embeddings
from pymilvus import MilvusClient, connections
from backend.core import config



# LOCAL_MILVUS_DIR = "milvus_local_test.db"
DEFAULT_INDEX_PARAMS = {"index_type": "FLAT", "metric_type": "L2"}
# 缓存全局唯一的 embedding 模型对象
embeddings = None
# 缓存全局唯一的 Milvus 向量库对象
vector_store = None

def get_embeddings():
    print("开始创建嵌入模型")
    global embeddings

    if embeddings is not None:
        print("embedding 模型已存在，直接复用")
        return embeddings
    
    embeddings = GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-2-preview",
        api_key=config.GEMINI_API_KEY,
    )
    return embeddings


def _ensure_orm_connection(uri: str) -> None:
    """兼容 langchain_milvus 当前版本内部混用 MilvusClient 和 ORM Collection。"""
    client = MilvusClient(uri=uri)
    connections.connect(alias=client._using, uri=uri)


def get_vector():
    embeddings = get_embeddings()
    global vector_store
    if vector_store is not None:
        print("已有向量数据库对象")
        return vector_store
    print("开始创建向量数据库")
     # 1. 先拿到 Milvus 的连接地址
    uri = config.MILVUS_URI
    # 2. 先补 ORM 连接，避免 langchain_milvus 这版库抽风
    _ensure_orm_connection(uri)
    # 3. 创建 LangChain 的 Milvus 向量库对象
    vector_store = Milvus(
        embedding_function=embeddings,
        connection_args={"uri": uri},
        collection_name=config.COLLECTION_NAME,
        index_params=DEFAULT_INDEX_PARAMS,
        auto_id=True,
        enable_dynamic_field=True,
    )
    print("向量数据库对象创建成功")

    return vector_store
