import hashlib
from backend.services.document_service import DocumentService
from backend.core import config
import os
#传入文件的二进制数据，转换成16进制的字符串
def get_md5(file_byte):
    md5_hash = hashlib.md5()
    md5_hash.update(file_byte)
    return md5_hash.hexdigest()



class FileService:
    def __init__(self):
        self.file_document = DocumentService()
    #接收前端传入的文件，判断文件是否存在，存在就跳过，不存在就把原文件保存在本地
    def save_file(self , file_name , file_byte , file_content_type):
        file_md5 = get_md5(file_byte)
        result = self.file_document.get_document_by_md5(file_name , file_md5)
        if result:
            return f"文件已经添加过了{file_name}"
        
        os.makedirs(config.DATA_SOURCE_DIR , exist_ok=True)
        file_path = os.path.join(config.DATA_SOURCE_DIR , file_name)

        with open(file_path , "wb") as f:
            f.write(file_byte)

        new_docs = self.file_document.save_document_file(file_name , file_path , file_md5 , file_content_type)
        self.file_document.get_extract_dir(file_path)
        return new_docs
    
    def save_dabatase(self , docunment_id):
        file_path = self.file_document.serch_path(docunment_id)
        response = self.file_document.process_pipeline(file_path)
        return response



    






        
