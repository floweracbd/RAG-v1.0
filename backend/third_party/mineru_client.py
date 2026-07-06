import os 
import requests
import time
from dotenv import load_dotenv  
import zipfile
import warnings
from pathlib import Path
load_dotenv()
#上传文件到mineru的服务器进行处理
def upload_mineru(file_path):
    if not os.path.exists(file_path):
        return f"找不到这个文件：{file_path},请检查路径"
    
    token = os.getenv("MinerU_API_KEY")
    filename = os.path.basename(file_path)

    apply_url = "https://mineru.net/api/v4/file-urls/batch"
    headers = {
        "Content-Type" : "application/json",
        "Authorization" : f"Bearer {token}"
    }
    data = {
        "files" : [{"name" : filename , "data_id" : "test_01"}],
        "model_version" : "vlm"
    }
    res = requests.post(apply_url , headers=headers , json=data)
    res_json = res.json()

    if res_json.get("code") != 0:
        return f"❌ 申请失败，大堂经理回复：{res_json}"
    
    batch_id = res_json["data"]["batch_id"]
    oss_upload_url = res_json["data"]["file_urls"][0]

    print("✅ 申请成功！")
    print(f"🔑 拿到取件码 (batch_id): {batch_id}")
    print(f"🌐 拿到公网仓库地址: {oss_upload_url[:60]}... (太长了只打印一半)")

    print("\n🚚 [2/2] 正在把本地文件装车，直传到临时仓库...")
    with open(file_path, 'rb') as f:
        # 💥 极其关键：用 PUT 请求！不带任何 headers，直接塞 data=f
        upload_res = requests.put(oss_upload_url, data=f)

    if upload_res.status_code == 200:
        print("\n🎉 直传成功！云端仓库已签收！")
        print("💡 此时 MinerU 已经在后台自动开始用视觉大模型切肉了！")
        print(f"👉 下一步提示：你需要拿着 batch_id [{batch_id}] 去轮询结果！")
    else:
        print("\n❌ 直传失败！状态码：", upload_res.status_code)

    return batch_id

#通过得到的batch_id得到压缩包的下载链接
def check_mineru_result(batch_id):
    token = os.getenv("MinerU_API_KEY")
    url = f"https://mineru.net/api/v4/extract-results/batch/{batch_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    while True:
        res = requests.get(url , headers=headers)
        res_json = res.json()
        status = res_json["data"]["extract_result"][0]["state"]
        if status == "done":
            print("\n🎉 洗完了！后厨交货了！")
            download_url = res_json["data"]["extract_result"][0]["full_zip_url"]
            print(f"🔗 提货地址: {download_url}")
            return download_url
        elif status == "waiting-file":
            print("\n等待文件上传提交")
        elif status == "running":
            print("\n正在解析")
        elif status == "failed":
            print("\n❌ 解析失败")
        elif status == "converting":
            print("\n格式转换中")
        else:
            print("⌛ 视觉大模型师傅还在切肉，满头大汗中... 睡 5 秒后再去催...")
        time.sleep(5)
#通过下载链接下载对应的压缩包，解压压缩包得到里面的内容
def process_pdf_pipeline(file_path):
    warnings.filterwarnings('ignore', message='Unverified HTTPS request')
    batch_id = upload_mineru(file_path)
    if not batch_id:
        return "❌ 上传阶段失败，流水线终止。"
    fresh_zip_url = check_mineru_result(batch_id)
    if not fresh_zip_url:
        return "❌ 轮询阶段失败，流水线终止。"
    try:
        res = requests.get(fresh_zip_url, verify=False, timeout=60)
        if res.status_code == 200:
            temp_zip = "temp_download.zip"
            extract_dir = "./mineru_temp_result"
            with open(temp_zip, "wb") as f:
                f.write(res.content)

            with zipfile.ZipFile(temp_zip, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)

            os.remove(temp_zip)
            print(f"✅ 流水线完美竣工！肉已洗净并存放在: {extract_dir}")
            return extract_dir
    except Exception as e:
        print(f"❌ 下载过程发生意外断裂: {e}")

    