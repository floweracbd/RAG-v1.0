import os 
from pathlib import Path
#源文件存放地址
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

DATA_SOURCE_DIR = PROJECT_ROOT / "data_source"

#gemini配置信息
GEMINI_API_KEY = ""


#文本分割递归符号
separators = ["\n\n" , "\n" , "." , "!" , "?" , "。" , "！" , "？" , " " , ""]

#Milvus配置信息
MILVUS_URI = ""
COLLECTION_NAME = "zhuzhuxia"

