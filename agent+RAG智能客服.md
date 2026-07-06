
1. `file_service.py`

首先先写一个函数，用来接收前端穿过来的文件的二进制，生成对应的MD5格式的字符串。

```python
def get_md5(file_byte):
    md5_hash = hashlib.md5()
    md5_hash.update(file_byte)
    return md5_hash.hexdigest()
	database.py（用来创建数据库的连接）
```
接下来判断这个文件是否已经上传过了，需要去数据库查询对应的md5所以我们首先要创建数据库的连接，设计对应表的内容跟结构，最后初始化这个表
`database.py`
```python
#数据库的连接地址
	from sqlalchemy import create_engine
	from sqlalchemy.orm import declarative_base, sessionmaker
	import os
	DB_URL = os.getenv("DB_URL")
	engine = create_engine(DB_URL , echo=True)
	SessionLocal = sessionmaker(autocommit=False , autoflush=False , bind=engine)
	Base = declarative_base()
```
上一步是创建了数据库的连接，我们现在需要去设计我们需要的表
`orm_models.py`
```python
from datetime import datetime
from sqlalchemy import Column , DateTime , Integer , String
from backend.core.database import Base
#想要在构建对应的表结构就必须继承`database.py`文件中的Base
class Document(Base):
 __tablename__ = "documents"
 id = Column(Integer , primary_key=True , index=True)
 file_name = Column(String , nullable=False)
 file_path = Column(String , nullable=False)
 file_md5 = Column(String , nullable=False , unique=True)
 file_type = Column(String , nullable=False)
 status = Column(String , nullable=False , default="peding")
 #这个是添加创建时间，我们上传的文件是什么时间上传的
 created_at = Column(DateTime , default=datetime.utcnow)
```
到这里我们就已经设计好了这个表的结构，但是还没有创建这个表
`init_db.py`
```python
from backend.core.database import engine , Base
from backend.models.orm_models import Document
def init_db():
	Base.metadata.create_all(bind=engine)
	
if __name__ == "__main__":
	init_db()
```
运行完这个就是创建好了一个数据表了
我们现在需要拿着前面转化的16进制的md5去这个数据库中查询有没有对应的md5，有的话直接return不往下进行了，没有的话我们需要添加对应的数据
`document_service.py`
```python
from backend.core.database import SessionLocal
from backend.models.orm_models import Document

#判断这个md5是否存在
def get_document_by_md5(file_md5)
	try:
		session = SessionLocal()
		existing = session.query(Document).filter(Document.file_md5 == file_md5).first()
		if existing:
			return True
		return False
	finally:
		session.close()
```
文件不存在的话我们需要把对应的文件信息存入到数据库中
```python
def save_document_file(file_name , file_path , file_md5 , file_type , status="pending"):
	session = SessionLocal()
	try:
		new_raw = Document(
		file_name = file_name,
		file_path = file_path,
		file_md5 = file_md5,
		file_type = file_type,
		status = status
		)
		session.add(new_raw)
		session.commit()
		session.refresh(new_raw)
	except Exception as e:
		session.rollback()
		raise f"添加文档失败{e}"
	finally:
		session.close()
```
到这里文件信息就添加到数据库中了，但是源文件我们还没有进行本地的保存
`file_service`
```python
def save_file(file_name , file_type , file_byte):
	file_md5 = get_md5(file_byte)
	boole = get_document_by_md5(file_md5)
	if boole:
		return "文件已经上传过了"
	#获取存放文件的绝对路径
	PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
	DATA_SOURCE_DIR = PROJECT_ROOT / "data_source"
	file_path = os.path.join(DATA_SOURCE_DIR , file_name)
	#存储原文件
	with open(file_path , "wb") as f:
		f.write(file_byte)
	#存储原文件的数据
	new_docs = 	save_document_file(file_name , file_path , file_md5 , file_type)
	return "文件已经存储成功"
```
现在完成了文件的上传与原文件的存储，下一步需要对文件进行提取
`document_service.py`
```python
def file_loader(file_path):
#定义一个字典用来判断上传的类型，给出不同的解析方式
	loader_dict = {
		".txt": TextLoader,
        ".pdf": PyPDFLoader,
        ".docx": Docx2txtLoader,
        ".csv": CSVLoader,
        ".md": UnstructuredMarkdownLoader,
	}
	
	ext = os.path.splitext(file_path)[-1].lower()
	if ext not in loader_dict:
		return "没有这个类型的文件"
	loader = loader_dict[ext](file_path)
	return loader.load()
```
分割我们提取好的对象，先用简单的递归分割
```python
def file_split(raw_document):
	file_splitter = RecursiveCharacterTextSplitter(
	chunk = 500,
	chunk_overlap = 50,
	separators = ["\n\n" , "\n" , "." , "!" , "?" , "。" , "！" , "？" , " " , ""]
	)
	return file_splitter.split_documents(raw_docement)
```
切割好的文本需要存入向量数据库，这里我们使用milvus
`milvus.py`
```python
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_milvus import Milvus
from openai import embeddings
from pymilvus import MilvusClient, connections

DEFAULT_INDEX_PARAMS = {"index_type": "FLAT", "metric_type": "L2"}
# 缓存全局唯一的 embedding 模型对象
embeddings = None
# 缓存全局唯一的 Milvus 向量库对象
vector_store = None
def get_embeddings():
	global embeddings
	if embeddings is not None:
		return embeddings
	embedding = GoogleGenerativeAIEmbeddings(
		model = "gemini-embedding-2-preview"
	)
	returen embeddings
	
def _ensure_orm_connection(uri: str) -> None:
    """兼容 langchain_milvus 当前版本内部混用 MilvusClient 和 ORM Collection。"""
    client = MilvusClient(uri=uri)
    connections.connect(alias=client._using, uri=uri)
    
def get_vector():
	embeddings = get_embeddings()
	global vector_store
	if vector_store is not None:
		returen vector_store
	uri = "you milvus"
	vector = Milvus(
		embedding_function=embeddings,
		connection_args={"uri" : uri},
		collection_name="zhuzhuxia"
		index_params=DEFAULT_INDEX_PARAMS,
		auto_id=True,
		enable_dynamic_field=True
	)
	return vector_store
```
创建好了这个向量数据库我们需要把切割好的文档进行向量化存入
`document_service.py`
```python
def process_pipeline(file_path):
	raw_document = file_loader(file_path)
	chunk_docs = file_split(raw_document)
	vector = get_vector()
	vector.add_documents(chunk_docs)
	return "文件成功存入向量数据库中了"
```
文件上传板块到这就算是结束了，下一步准备开始用户问题传入的板块
首先用户传入问题，然后到向量数据库中检索
`retrieval_service.py`
```python
from backend.core.milvus import get_vector
def vector_search(question):
	vector = get_vector()
	results = vector.similarity_search(
	question,
	k=3,
	)
	return results
```
获得了最相似的3条答案，然后我们把这个rag封装成一个工具，等下需要被agent自主调用
`knowledge_tools.pt`
```python
from langchain.tools import tool
@tool
def local_knowledge(question):
"""
【本地电商知识库检索工具】
    当你（客服）需要回答关于：特定商品信息、退换货政策、物流规则、内部设定（如《猪猪侠》资料）等具体业务细节时，**必须首先调用此工具**。
    传入的 question 应该是提取出的核心搜索关键词或简练的问题语句。
    工具会返回相关的内部权威文档片段，你必须基于这些片段来回答用户。

    Args:
        question : 用户传入的消息
"""
	raw_documents = vector_search(question)
	response = "/n/n".join([doc.content for doc in raw_documents])

```
这个工具最终返回的是我们拼装好的一个字符串
接下来需要定义一个 agent把这个工具传给他
`agent_service.py`
```python
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
def rag_agent(question):
	model = init_chat_model(
		model = "deepseek-v4-flash",
		model_probider = "openai",
		base_url = "deepseek di zhi",
	)
	agent = creat_agent(
		model = model,
		tools = [local_knowledge]
		system_prompt = "tishichi"
	)
	response = agent.invoke({"message" : {"role" : "user" , "content" : question}})
	return response["messages"][-1].content
```
这个时候agent已经可以自主的去判断调用rag了，但是还不存在记忆，只能是单次的对话，下一步我们需要给他添加记忆功能，存储在我们前面的postgresql数据库中
`session_service.py`
```python
from langgraph.checkpoint.postgres import PostgresSaver
class SessionService:
	_ctx = None
	_checkpointer = None
	def __init__(self):
	if SessionService._checkpointer is None:
		db_url = "连接数据库的参数"
		if not db_url:
			raise ValueErrpr("没有读取到 DB_URL，请检查 .env 文件")
		SessionService._ctx = PostgresSaver.from_conn_string(DB_URI)
		SessionService._checkpointer = SessionService._ctx.__enter__()
		SessionService._checkpointer.setup()
		
	def get_checkpointer(self):
		return SessionService._checkpointer
```
这个独立出来的好处是他不会自动关闭，不用每次存储都要创建这个东西
这个参数得到了之后需要把它传入到前面创建的agent中
```python
agent = creat_agent(
		model = model,
		tools = [local_knowledge],
		checkpointer=get_checkpointer(),
		system_prompt = "tishichi",
	)
```
到这里已经是一个完整的agent了，接下来需要写接口了，接口我们需要写4个，一个文件上传的接口，一个对话接口，一个上传文件信息查询接口，一个对话记忆查询接口
我们先写文件上传的接口，需要对文件上传结果进行一个返回
`schemas.py`
```python
from pydantic import BaseModel , Field

class UploadResponse(BaseModel):
	status : str = Field(description="上传的状态，比如success 或 error")
    filename : str = Field(description="上传的原始文件名")
    message : str = Field(description="底层处理结果详情（如入库成功信息）")
    file_size : int = Field(description="文件大小(字节数)")
```
`upload_router.py`
```python
from fastapi import APIRouter , HTTPException , UploadFile , File

router = APIRouter()
file_service = FileService()

@router.post("/" , response_model = UploadResponse)
def upload_router(file : UploadFile = File(...)):
	file_name = file.filename
	file_tyte = await file.read()
	file_type = file.content_type
	result_message = file_service.save_file(file_name , file_byte , file_type)
	return UploadResponse(
		status="success",
            filename=file_name,
            message=result_message,
            file_size=len(file_byte)
	)
```













```python
from fastapi import APIRouter , HTTPException , File , Uploadfile

router = APIRouter()

file_service = FileService()

@router.post("/" , response_model = pydantic)
def   qwewqewq(file : Uploadfile(File(...))):
	try:
		file_name = file.filename
		file_byte = await file.read()
		file_type = file.content_type
		response = file_service.get_file(file_name , file_byte , file_type)
		return pandantic(
			filename = file_name
			filetype = file_type
			stater = success
			file_size = len(file_byte)
		)
	except Exception as e:
		raise HTTPException(status=500 , detail=str(e))
		
		
		
		
		
#问答接口
class A(BaseModel):
	question : str = Field()

```








