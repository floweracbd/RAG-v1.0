"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BotMessageSquare, Database, Files } from "lucide-react";
import { fetchDocuments, fetchHistory, sendChat, uploadDocument, vectorizeDocument } from "@/lib/api";
import { getOrCreateThreadId, rotateThreadId } from "@/lib/session";
import type { ActionState, DocumentItem, UiMessage, UploadResponse } from "@/lib/types";
import { KnowledgePanel } from "@/components/knowledge-panel";
import { ChatPanel } from "@/components/chat-panel";
import { StatusPanel } from "@/components/status-panel";

type Mode = "dashboard" | "knowledge" | "chat";

const welcomeMessage: UiMessage = {
  id: "welcome",
  role: "ai",
  content: "欢迎来到电商客服 RAG 工作台。上传知识库文件后，可以基于现有后端接口执行向量化与问答。"
};

function createAction(kind: ActionState["kind"], title: string, detail?: string): ActionState {
  return {
    kind,
    title,
    detail,
    time: new Date().toLocaleString("zh-CN")
  };
}

export function WorkspaceView({ mode }: { mode: Mode }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([welcomeMessage]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [lastAction, setLastAction] = useState<ActionState>(createAction("idle", "等待操作", "当前尚未执行任何前端动作。"));

  useEffect(() => {
    setThreadId(getOrCreateThreadId());
  }, []);

  const refreshDocuments = useCallback(async () => {
    try {
      const result = await fetchDocuments();
      setDocuments(result.documents);
      setBackendOnline(true);
      setLastAction((current) => current.kind === "working" ? createAction("success", "文档列表已刷新", `当前共有 ${result.total} 条文档记录。`) : current);
    } catch (error) {
      setBackendOnline(false);
      setLastAction(createAction("error", "拉取文档列表失败", error instanceof Error ? error.message : "未知错误"));
    }
  }, []);

  useEffect(() => {
    void refreshDocuments();
  }, [refreshDocuments]);

  const handleUploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setLastAction(createAction("working", "正在上传文件", file.name));

    try {
      const result = await uploadDocument(file);
      setUploadResult(result);
      setSelectedDocumentId(result.id);
      setLastAction(createAction("success", "文件已上传", `${result.filename} 已写入数据库，document_id 为 #${result.id}`));
      await refreshDocuments();
    } catch (error) {
      setLastAction(createAction("error", "上传失败", error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsUploading(false);
    }
  }, [refreshDocuments]);

  const handleVectorizeDocument = useCallback(async (documentId: number) => {
    setSelectedDocumentId(documentId);
    setIsVectorizing(true);
    setLastAction(createAction("working", "正在写入向量库", `document_id #${documentId}`));

    try {
      const result = await vectorizeDocument(documentId);
      setLastAction(createAction("success", "向量化完成", result.status));
    } catch (error) {
      setLastAction(createAction("error", "向量化失败", error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsVectorizing(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (question: string) => {
    if (!threadId) {
      return;
    }

    const humanMessage: UiMessage = {
      id: `human-${Date.now()}`,
      role: "human",
      content: question
    };

    setMessages((current) => [...current, humanMessage]);
    setIsSending(true);
    setLastAction(createAction("working", "正在向后端发起问答", `thread_id ${threadId}`));

    try {
      const result = await sendChat({
        question,
        thread_id: threadId
      });

      const aiMessage: UiMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: result.reply
      };
      setMessages((current) => [...current, aiMessage]);
      setLastAction(createAction("success", "问答成功", "后端已返回回复内容。"));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "未知错误";
      setMessages((current) => [
        ...current,
        {
          id: `ai-error-${Date.now()}`,
          role: "ai",
          content: `当前问答请求失败：${detail}`
        }
      ]);
      setLastAction(createAction("error", "问答失败", detail));
    } finally {
      setIsSending(false);
    }
  }, [threadId]);

  const handleLoadHistory = useCallback(async () => {
    if (!threadId) {
      return;
    }

    setIsLoadingHistory(true);
    setLastAction(createAction("working", "正在拉取历史会话", `thread_id ${threadId}`));

    try {
      const result = await fetchHistory(threadId);
      const restoredMessages: UiMessage[] = result.messages.map((message, index) => ({
        id: `history-${index}-${message.role}`,
        role: message.role === "human" ? "human" : "ai",
        content: message.content
      }));
      setMessages(restoredMessages.length > 0 ? restoredMessages : [welcomeMessage]);
      setLastAction(createAction("success", "历史会话已加载", `当前拉取到 ${result.messages.length} 条消息。`));
    } catch (error) {
      setLastAction(createAction("error", "拉取历史失败", error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsLoadingHistory(false);
    }
  }, [threadId]);

  const handleNewSession = useCallback(() => {
    const nextThreadId = rotateThreadId();
    setThreadId(nextThreadId);
    setMessages([welcomeMessage]);
    setLastAction(createAction("success", "已创建新会话", `新的 thread_id 为 ${nextThreadId}`));
  }, []);

  const summaryCards = useMemo(
    () => [
      { label: "工作模式", value: mode === "dashboard" ? "双栏工作台" : mode === "knowledge" ? "知识库专注视图" : "问答专注视图", icon: Files },
      { label: "文档数量", value: String(documents.length), icon: Database },
      { label: "问答引擎", value: "FastAPI + Agent", icon: BotMessageSquare }
    ],
    [documents.length, mode]
  );

  const knowledgeBlock = (
    <KnowledgePanel
      documents={documents}
      selectedDocumentId={selectedDocumentId}
      isUploading={isUploading}
      isVectorizing={isVectorizing}
      uploadResult={uploadResult}
      onSelectDocument={setSelectedDocumentId}
      onRefreshDocuments={() => void refreshDocuments()}
      onUploadFile={(file) => void handleUploadFile(file)}
      onVectorizeDocument={(documentId) => void handleVectorizeDocument(documentId)}
    />
  );

  const chatBlock = (
    <ChatPanel
      threadId={threadId}
      messages={messages}
      isSending={isSending}
      isLoadingHistory={isLoadingHistory}
      onSendMessage={(question) => void handleSendMessage(question)}
      onNewSession={handleNewSession}
      onLoadHistory={() => void handleLoadHistory()}
    />
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel/85 p-6 shadow-panel backdrop-blur">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ecommerce RAG Workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">面向电商客服场景的知识库与问答工作台</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              独立于旧 Streamlit 的 Next.js 子应用，只消费现有 FastAPI 接口，用于更稳定地演示上传、向量化和智能问答主链路。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[620px]">
            {summaryCards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-line bg-slate-950/40 px-4 py-4">
                <div className="flex items-center gap-2 text-soft">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatusPanel
        backendOnline={backendOnline}
        documentCount={documents.length}
        selectedDocumentId={selectedDocumentId}
        threadId={threadId}
        lastAction={lastAction}
      />

      {mode === "dashboard" ? (
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          {knowledgeBlock}
          {chatBlock}
        </div>
      ) : mode === "knowledge" ? (
        <div className="space-y-6">{knowledgeBlock}</div>
      ) : (
        <div className="space-y-6">{chatBlock}</div>
      )}
    </div>
  );
}
