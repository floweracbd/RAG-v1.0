import streamlit as st
import requests

st.title("数据库知识更新")
file = st.file_uploader("请上传你的文件", type=["pdf", "docx", "md", "csv", "txt"])

# 💡 老王妙招：左右并排画两个按钮，逻辑彻底隔离开！
col1, col2 = st.columns(2)
upload_btn = col1.button("1. 仅上传文件到服务器", disabled=file is None)
save_btn = col2.button("2. 启动切肉入库流水线", disabled=file is None)


# ==========================================
# 动作 1：只有明确点击了"上传"按钮，才发 POST
# ==========================================
if upload_btn and file:
    try:
        url = "http://localhost:8000/upload/upload"
        files = {"file": (file.name, file.getvalue(), file.type)}
        res = requests.post(url, files=files)
        
        if res.status_code == 200:
            result = res.json()
            st.success(f"🎉 {result['message']}！文件大小：{result['file_size']} 字节")
            st.session_state.id = result["id"]
        else:
            st.error(f"❌ 上传炸了: {res.text}")
    except Exception as e:
        st.error(f"🔌 无法连接后端: {e}")

# ==========================================
# 动作 2：只有明确点击了"入库"按钮，才发 GET
# ==========================================
if save_btn:
    try:
        url = f"http://localhost:8000/upload/save?document_id={st.session_state.id}"
        
        # 加个炫酷的加载动画，因为切肉洗肉要等很久！
        with st.spinner("🤖 视觉大模型师傅正在疯狂切肉入库中，请耐心等待..."):
            res = requests.get(url)
            
        if res.status_code == 200:
            # 💡 修复展示问题：调用 .json() 拿里面的数据
            st.success("✅ 彻底完工！")
            st.info(res.json()) 
        else:
            st.error(f"❌ 入库炸了: {res.text}")
    except Exception as e:
        st.error(f"🔌 无法连接后端: {e}")