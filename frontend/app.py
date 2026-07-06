import streamlit as st

# 1. 设置全局页面的配置（必须写在第一行）
st.set_page_config(
    page_title="老王牌智能客服中控台",
    page_icon="🤖",
    layout="wide"
)

# 2. 迎宾大厅的内容
st.title("🚀 欢迎来到智能电商客服 Agent 中控台")
st.markdown("---")

st.markdown("""
### 👈 请看你的左侧边栏！

这里是系统的总控制台，老王已经为你开启了自动导航魔法。请点击左侧菜单进行操作：

* **📁 upload_page**: 去那里上传新的《猪猪侠》或者其他知识库文件，给大模型“喂饭”。
* **💬 chat_page**: 去那里验证你的知识库，跟大模型进行实时的智能问答！
""")

st.info("💡 提示：如果左侧边栏没弹出来，点一下页面左上角的 `>` 小箭头。")