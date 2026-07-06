
import os
from backend.core import config
from backend.core.database import SessionLocal
from backend.core.milvus import get_vector
from backend.models.orm_models import Documents
from langchain_classic.retrievers import ParentDocumentRetriever
from langchain_text_splitters import RecursiveCharacterTextSplitter 
from langchain_core.documents import Document 
from backend.services.session_service import SessionService
from backend.third_party.mineru_client import process_pdf_pipeline
import re
from pathlib import Path
class DocumentService:
    def __init__(self):
        self.extract_dir = ""
        self.session = SessionLocal()
        self.vectorstore = get_vector()
        #子切割器
        self.child_splitter = RecursiveCharacterTextSplitter(
            chunk_size=400,
            chunk_overlap=40,
            separators=config.separators,
        )
        #父切割器
        self.parent_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            separators=config.separators
        )
        self.session_store = SessionService()
        self.store = self.session_store.get_docstore()

        self.retriever = ParentDocumentRetriever(
            vectorstore=self.vectorstore,
            byte_store=self.store,
            child_splitter=self.child_splitter,
            parent_splitter=self.parent_splitter
        )
    #判断文件是否存在
    def get_document_by_md5(self, file_name, file_md5):
        try:
            existing = (
                self.session.query(Documents)
                .filter(Documents.file_md5 == file_md5)
                .first()
            )
            if existing:
                print(f"该文件已存在: {file_name}")
                return True
            return False
        finally:
            self.session.close()
    #把文件信息添加到数据库中
    def save_document_file(self,file_name,file_path,file_md5,file_type,status="pending"):
        try:
            new_doc = Documents(
                file_name=file_name,
                file_path=file_path,
                file_md5=file_md5,
                file_type=file_type,
                status=status,
            )

            self.session.add(new_doc)
            self.session.commit()
            self.session.refresh(new_doc)
            return {
                "messages" : f"新文件数据已经添加成功: {file_name}",
                "id" : new_doc.id
            }
        except Exception as e:
            self.session.rollback()
            print(f"添加文档失败: {e}")
            raise
        finally:
            self.session.close()
    #提取传入的文档
    def process_pipeline(self, file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"没有找到这个文件: {file_path}")
        #获取这个文件夹中的所有的md文件
        md_files = list(Path(self.extract_dir).rglob("*.md"))
        if not md_files:
            raise FileNotFoundError("没有找到md文件")
        target_md_path = md_files[0]
        with open(target_md_path , "r" , encoding="UTF-8") as f:
            raw_text = f.read()
        clean_markdown_string = self.clean_markdown_text(raw_text)
        raw_document = Document(
            page_content=clean_markdown_string,
            metadata={"source" : os.path.basename(file_path) , "parser": "MinerU_V4_ParentChild"},
            
        )
        try:
            self.retriever.add_documents([raw_document])
            return "文件添加向量数据库成功"
        except Exception as e:
            return f"添加失败报错记录: {str(e)}"

    #清洗md文件中的图片等等杂乱内容
    def clean_markdown_text(self , raw_text):
        clean_text = re.sub(r'!\[.*?\]\(.*?\)', '', raw_text)
        clean_text = re.sub(r'<img[^>]*>', '', clean_text)
        clean_text = re.sub(r'\n{3,}', '\n\n', clean_text)
        clean_text = re.sub(r'[\u200b-\u200f\ufeff]', '', clean_text)
        clean_text = clean_text.strip()
        return clean_text
        

    #将数据进行切割存入向量数据库
    def get_extract_dir(self , file_path):
        self.extract_dir = process_pdf_pipeline(file_path)

    #查询前端上传文件的对应存放路径
    def serch_path(self , document_id):
        db_file = self.session.query(Documents).filter(Documents.id == document_id).first()
        if not db_file:
            raise ValueError(f"❌ 完蛋！文件id： {document_id} 是无效的")
        return db_file.file_path

