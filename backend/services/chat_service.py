#RAG问答服务
import os 
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from backend.rag.prompts import user_prompt , system_prompt
from langchain_core.output_parsers import StrOutputParser
from backend.services.retrieval_service import Retrieval

load_dotenv(override=True)

class ChatService:
    def __init__(self):
        #创建deepseek模型
        print("开始创建模型")
        self.model = init_chat_model(
            model=os.getenv("MODEL"),
            base_url=os.getenv("BASE_URL"),
            model_provider="openai",
            api_key=os.getenv("API_KEY")
        )
        print("模型创建成功")
        #传给模型的提示词
        self.prompts = ChatPromptTemplate([
            ("system" , system_prompt),
            ("human" , user_prompt)
        ])

        self.retrieval_service = Retrieval()

    def get_chain_response(self , question):
        #获取检索后返回的数据
        print("开始检索相似的数据")
        search = self.retrieval_service.vector_search(question)
        print("检索成功，返回3条数据")
        #获取链
        chain = self.prompts | self.model | StrOutputParser()
        print("开始发送给模型数据")
        response = chain.invoke({"context" : search , "question" : question})
        print("返回最终结果")
        return response



