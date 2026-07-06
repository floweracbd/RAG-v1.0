
import traceback
from langchain.chat_models import init_chat_model
import os 
from dotenv import load_dotenv
from langchain.agents import create_agent
from backend.tools.knowledge_tools import local_knowledge
from backend.services.session_service import SessionService
from backend.rag.prompts import system_prompt
from backend.models.schemas import MessageItem
load_dotenv(override=True)

class AgentService:
    def __init__(self):
        self.checkpointer = SessionService().get_checkpointer()
        self.model = init_chat_model(
            model=os.getenv("MODEL"),
            model_provider="openai",
            api_key=os.getenv("API_KEY"),
            base_url=os.getenv("BASE_URL")
        )
        print("开始创建智能体")
        self.agent = create_agent(
            model=self.model,
            tools=[local_knowledge],
            checkpointer=self.checkpointer,
            system_prompt=system_prompt
        )
        print("智能体创建成功")
    def rag_agent(self , qestion , session_id):
        print("开始创建传入问题")
        try:
            response = self.agent.invoke({"messages" : [{"role" : "user" , "content" : qestion}]},
                                        config={"configurable" : {"thread_id" : session_id}})
            print("输出最终答案")
            return response["messages"][-1].content
        except Exception as e:
            traceback.print_exc()
            raise e
    #调取对应用用户的记忆
    def get_chat_history(self , thread_id):
        config = {"configurable" : {"thread_id" : thread_id}}

        state = self.agent.get_state(config)
        raw_messages = state.values.get("messages" , [])
        cooked_messages = []
        for msg in raw_messages:
            if msg.type in ["human" , "ai"] and msg.content:
                role_name = msg.type
            item = MessageItem(
                role=role_name,
                content=msg.content
            )
            cooked_messages.append(item)

        return cooked_messages
        