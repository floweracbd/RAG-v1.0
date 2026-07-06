
import uuid

import streamlit as st

import requests


st.title("智能电商客服")
question = st.chat_input()

if "memory" not in st.session_state:
    st.session_state.memory = [{"role" : "ai" , "content" : "请问有什么可以帮助你的"}]

if "session_id" not in st.session_state:
     st.session_state.session_id = str(uuid.uuid4())

for msg in st.session_state.memory:
        st.chat_message(msg["role"]).write(msg["content"])


if question:
    st.chat_message("human").write(question)
    st.session_state.memory.append({"role" : "human" , "content" : question})
    with st.spinner("客服正在思考中"):
        try:
             url = "http://localhost:8000/chat/"
             payload = {
                   "question" : question,
                    "thread_id" : st.session_state.get("session_id", "streamlit_user_001")
             }
             res = requests.post(url , json=payload)
             if res.status_code == 200:
            # 严格按照后端的 ChatResponse 格式取货
                final_answer = res.json()["reply"]
                st.chat_message("ai").write(final_answer)
                st.session_state.memory.append({"role" : "ai" , "content" : final_answer})

        except Exception as e:
            st.error(f"❌ 后厨做菜失败，状态码: {res.status_code}, 原因: {res.text}")

    
