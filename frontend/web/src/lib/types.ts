export type UploadResponse = {
  id: number;
  status: string;
  filename: string;
  message: string;
  file_size: number;
};

export type SaveDatabaseResponse = {
  status: string;
};

export type DocumentItem = {
  id: number;
  file_name: string;
  file_type: string;
  file_md5: string;
};

export type DocumentListResponse = {
  total: number;
  documents: DocumentItem[];
};

export type ChatRequest = {
  question: string;
  thread_id: string;
};

export type ChatResponse = {
  reply: string;
};

export type MessageItem = {
  role: string;
  content: string;
};

export type SessionHistoryResponse = {
  session_id: string;
  messages: MessageItem[];
};

export type UiMessage = {
  id: string;
  role: "ai" | "human";
  content: string;
};

export type ActionState = {
  kind: "idle" | "success" | "error" | "working";
  title: string;
  detail?: string;
  time?: string;
};
