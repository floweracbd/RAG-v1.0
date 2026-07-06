import type {
  ChatRequest,
  ChatResponse,
  DocumentListResponse,
  SaveDatabaseResponse,
  SessionHistoryResponse,
  UploadResponse
} from "@/lib/types";

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const detail = payload?.detail ?? payload?.message ?? text ?? "请求失败";
    throw new Error(typeof detail === "string" ? detail : "请求失败");
  }

  return payload as T;
}

export async function fetchDocuments() {
  const response = await fetch("/api/documents", {
    method: "GET",
    cache: "no-store"
  });
  return parseResponse<DocumentListResponse>(response);
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  return parseResponse<UploadResponse>(response);
}

export async function vectorizeDocument(documentId: number) {
  const response = await fetch("/api/vectorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ documentId })
  });

  return parseResponse<SaveDatabaseResponse>(response);
}

export async function sendChat(request: ChatRequest) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  return parseResponse<ChatResponse>(response);
}

export async function fetchHistory(threadId: string) {
  const response = await fetch(`/api/history/${threadId}`, {
    method: "GET",
    cache: "no-store"
  });

  return parseResponse<SessionHistoryResponse>(response);
}
