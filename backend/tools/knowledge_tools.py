#将前面的rag封装成一个工具
from backend.services.retrieval_service import Retrieval
from langchain.tools import tool

retrieval = Retrieval()
@tool
def local_knowledge(question : str):
    """
    【本地电商知识库检索工具】
    当你（客服）需要回答关于：特定商品信息、退换货政策、物流规则、内部设定（如《猪猪侠》资料）等具体业务细节时，**必须首先调用此工具**。
    传入的 question 应该是提取出的核心搜索关键词或简练的问题语句。
    工具会返回相关的内部权威文档片段，你必须基于这些片段来回答用户。

    Args:
        question : 用户传入的消息
    """
    try:
        raw_document = retrieval.vector_search(question)

        pure_text_response = "\n\n".join([doc.page_content for doc in raw_document])
        print(pure_text_response)
        return pure_text_response
    except Exception as e:
        return f"知识库检索失败: {str(e)}"