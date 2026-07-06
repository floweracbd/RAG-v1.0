#检索服务
import torch
from backend.core.milvus import get_vector
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from backend.core import config
from backend.services.session_service import SessionService
from langchain_classic.retrievers import ParentDocumentRetriever
from langchain_text_splitters import RecursiveCharacterTextSplitter
#查询最相似的3条数据
class Retrieval:
    def __init__(self):
        self.vector = get_vector()
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

        self.store = SessionService().get_docstore()
        self.retriever = ParentDocumentRetriever(
            vectorstore=self.vector,
            byte_store=self.store,
            child_splitter=self.child_splitter,
            parent_splitter=self.parent_splitter
        )
        self.retriever.search_kwargs = {"k" : 10}

        self.reranker_model = HuggingFaceCrossEncoder(
            model_name = "BAAI/bge-reranker-v2-m3",
            model_kwargs={'device': 'cuda'}
        )
        
        self.compressor = CrossEncoderReranker(model = self.reranker_model , top_n = 5)
        self.compressor_retriever = ContextualCompressionRetriever(
            base_compressor=self.compressor,
            base_retriever=self.retriever
        )

    def vector_search(self , question):
        #粗检索出来相近的10条

        docs = self.compressor_retriever.invoke(question)
        return docs


        
    
