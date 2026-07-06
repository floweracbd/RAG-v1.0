# PROJECT STRUCTURE

## 项目结构

这一版采用更适合当前阶段的折中结构：最外层保留 `frontend` 和 `backend`，方便快速理解；后端内部再做适度分层，避免后面全写乱。

```text
ecommerce-rag-agent/
|
+--- frontend/                             # Streamlit 页面目录
|    |
|    +--- app.py                           # 前端入口
|    +--- pages/
|         +--- upload_page.py              # 上传与知识库管理页面
|         +--- chat_page.py                # 聊天问答页面
|
+--- backend/                              # FastAPI 后端主目录
|    |
|    +--- main.py                          # FastAPI 入口，注册路由与应用初始化
|    |
|    +--- api/                             # 路由层，只负责接请求和回响应
|    |    |
|    |    +--- chat_router.py              # 问答接口
|    |    +--- upload_router.py            # 上传接口
|    |    +--- document_router.py          # 文档列表、详情、删除接口
|    |    +--- session_router.py           # 会话与消息接口
|    |
|    +--- core/                            # 核心配置与基础连接
|    |    |
|    |    +--- config.py                   # 环境变量和系统配置
|    |    +--- database.py                 # PostgreSQL 连接与会话管理
|    |    +--- milvus.py                   # Milvus 连接与 collection 初始化
|    |    +--- logging.py                  # 日志配置
|    |
|    +--- models/                          # 数据模型层
|    |    |
|    |    +--- schemas.py                  # Pydantic 请求/响应模型
|    |    +--- orm_models.py               # SQLAlchemy 表结构映射
|    |
|    +--- services/                        # 业务逻辑层
|    |    |
|    |    +--- file_service.py             # 文件保存、MD5、路径管理
|    |    +--- document_service.py         # 文档解析、切块、入库流程
|    |    +--- retrieval_service.py        # 检索服务
|    |    +--- chat_service.py             # RAG 问答服务
|    |    +--- session_service.py          # 会话与消息管理
|    |    +--- agent_service.py            # 单 Agent 服务
|    |
|    +--- rag/                             # RAG 能力封装
|    |    |
|    |    +--- vector_store.py             # Milvus 写入与检索封装
|    |    +--- prompts.py                  # RAG 提示词
|    |
|    +--- tools/                           # Agent 可调用工具
|         |
|         +--- knowledge_tools.py          # 知识库检索工具封装
|
+--- data_source/                          # 原始上传文件暂存目录
|
+--- scripts/                              # 初始化和辅助脚本
|    |
|    +--- init_db.py                       # 初始化 PostgreSQL 表结构
|    +--- init_milvus.py                   # 初始化 Milvus collection
|
+--- tests/                                # 测试目录
|    |
|    +--- test_upload.py                   # 上传流程测试
|    +--- test_retrieval.py                # 检索流程测试
|    +--- test_chat.py                     # 问答流程测试
|
+--- .env.example                          # 环境变量模板
+--- requirements.txt                      # Python 依赖
+--- README.md                             # 项目说明
+--- PROJECT_PLAN.md                       # 项目整体方案
+--- PROJECT_STRUCTURE.md                  # 项目结构说明
+--- TASKS.md                              # 开发任务清单
```

## 为什么改成这版结构

这版结构的目标不是追求最细最全，而是做到两件事：

1. 你第一次看就能大概明白每个目录是干什么的
2. 后面功能变多时，又不至于所有代码全塞在几个文件里

简单说：

- `frontend` / `backend` 这层让你容易理解
- `api` / `core` / `models` / `services` / `rag` / `tools` 这层让项目不乱

## 模块职责说明

### 1. `frontend`

放 Streamlit 页面，只负责演示和交互，不在这里写核心业务逻辑。

### 2. `backend/main.py`

这是 FastAPI 后端入口文件，负责初始化应用、注册路由、挂载全局配置。

### 3. `backend/api`

这里放接口文件。它的职责是：

1. 接收参数
2. 调用 service
3. 返回结果

不要在这里写太多业务逻辑。

### 4. `backend/core`

这里放基础设施代码，包括：

1. 配置
2. PostgreSQL 连接
3. Milvus 连接
4. 日志

### 5. `backend/models`

这里放两类模型：

1. `schemas.py`：接口参数校验和响应结构
2. `orm_models.py`：数据库表结构映射

### 6. `backend/services`

这里是项目主业务层，是第一版最核心的目录。上传、解析、切块、入库、检索、问答、会话这些逻辑都放在这里。

### 7. `backend/rag`

这里专门放和 RAG 主链路紧密相关的代码，比如 Milvus 检索封装、RAG prompt 等。

### 8. `backend/tools`

这里放给 Agent 调用的工具。第一版最关键的是把知识库检索能力包装成工具。

## 模块调用关系

### 上传入库调用链

`Streamlit / Swagger -> upload_router -> document_service -> file_service -> Milvus + PostgreSQL`

### 问答调用链

`Streamlit / Swagger -> chat_router -> chat_service -> retrieval_service -> Milvus -> PostgreSQL -> LLM`

### Agent 调用链

`Frontend / API -> agent_service -> knowledge_tools -> retrieval_service -> chat_service`

## 第一版结构设计原则

1. 先让自己写得下去，再谈过度抽象
2. 同一层只放同一类职责
3. 上传入库和问答链路分开写
4. Agent 能力建立在 RAG 已可用的前提上
5. 先保证清晰，再逐步演进成更细的工程结构

## 你可以怎么照着创建

如果你准备亲手建目录，可以按下面顺序来：

1. 先建项目根目录 `ecommerce-rag-agent`
2. 再建一级目录：`frontend`、`backend`、`data_source`、`scripts`、`tests`
3. 再建 `backend` 下面的二级目录：`api`、`core`、`models`、`services`、`rag`、`tools`
4. 最后再建每个 `.py` 文件

第一次做项目时，先把目录搭出来，会比一边想一边乱建轻松很多。

## 后续版本结构演进说明

### 第一版结构定位

第一版结构以“先跑通完整链路”为优先目标，因此当前结构允许一定程度的工程简化。重点是把上传、入库、检索、问答、记忆、单 Agent 工具调用这些能力先串起来。

### 第二版结构演进方向

第二版继续保留当前总体目录结构，但优先增强 `services`、`rag`、`tools` 三层能力，重点包括：

1. 在 `services` 中补充更清晰的数据清洗与切分流程
2. 在 `rag` 中逐步加入父子分块、检索调优、重排序等能力
3. 在 `tools` 中继续保持知识库检索工具封装，并为不同检索策略预留入口

第二版原则上不急于大改前后端组织方式，而是优先提升 RAG 主链路质量。

### 第三版结构演进方向

第三版继续基于当前结构扩展业务工具能力，重点包括：

1. 在 `tools` 中新增订单查询、物流查询、售后规则查询等工具
2. 在 `services` 中补充对应业务查询服务
3. 在 `api` 中视需要增加业务调试接口
4. 在 `agent_service` 中统一管理多工具调用能力

第三版的重点不是推翻目录结构，而是在现有结构上自然长出业务型 Agent 能力。








结构：前端       网页部分
	  后端--api层面
		  --业务层面
		  --工具层面
		  --提示词层面
		  --数据库连接层面
		  --数据库初始化层面



整体项目逻辑
1，文件上传，用户上传文件，获取文件的二进制数据，调用md5函数来得到16进制的字符串，进入postgresql中查询文件是否重复，重复的话直接返回前端，不重复的话，获取文件的后缀，创建一个字典，给出每个文件类型对应的解析方式，判断文件后缀对应的是哪个来进行内容解析，得到文件的内容，拼接文件绝对路径，把源文件存放在文件夹中，然后把文件的信息存放在postgresql数据库中，（数据库需要先创建一个连接，然后再设定一个表结构，最后初始化这个表），然后对文件进行切割，切割好之后把每个块转换成向量，嵌入milvus向量数据库中（milvus需要先建立连接，创建出来一个milvus的对象），整个文件上传算是完成
2，创建向量检索，去向量数据库中检索最相似的3条，然后返回3个数据，创建一个工具函数，把暴露出来的检索接口放在工具函数中，创建一个agent，把工具传入进去


























