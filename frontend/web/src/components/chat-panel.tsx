"use client";

import { Loader2, RefreshCcw, SendHorizonal } from "lucide-react";
import type { UiMessage } from "@/lib/types";

type ChatPanelProps = {
  threadId: string;
  messages: UiMessage[];
  isSending: boolean;
  isLoadingHistory: boolean;
  onSendMessage: (question: string) => void;
  onNewSession: () => void;
  onLoadHistory: () => void;
};

export function ChatPanel(props: ChatPanelProps) {
  return (
    <section className="rounded-lg border border-line bg-panel/85 p-5 shadow-panel backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">智能问答</p>
          <p className="mt-1 text-xs text-soft">通过 Next 代理调用现有 FastAPI `/chat/` 接口。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={props.onLoadHistory}
            disabled={props.isLoadingHistory}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-slate-950/40 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {props.isLoadingHistory ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            拉取历史
          </button>
          <button
            type="button"
            onClick={props.onNewSession}
            className="rounded-lg bg-accent2 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-105"
          >
            新会话
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-slate-950/45 px-4 py-3 text-xs text-soft">
        thread_id: <span className="font-mono text-slate-200">{props.threadId}</span>
      </div>

      <div className="mt-4 flex h-[620px] flex-col overflow-hidden rounded-lg border border-line bg-slate-950/35 xl:h-[680px]">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 lg:px-5">
          {props.messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "human" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-7 lg:max-w-[82%] ${message.role === "human" ? "bg-accent text-slate-950" : "border border-line bg-slate-900/90 text-slate-100"}`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <ChatComposer onSend={props.onSendMessage} disabled={props.isSending} />
      </div>
    </section>
  );
}

function ChatComposer({ onSend, disabled }: { onSend: (question: string) => void; disabled: boolean }) {
  const submitQuestion = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const question = String(formData.get("question") || "").trim();

    if (!question) {
      return;
    }

    onSend(question);
    form.reset();
  };

  return (
    <form
      className="flex items-end gap-3 border-t border-line bg-slate-950/80 px-4 py-4 lg:px-5"
      onSubmit={(event) => {
        event.preventDefault();
        submitQuestion(event.currentTarget);
      }}
    >
      <textarea
        name="question"
        rows={4}
        placeholder="输入要提问的业务问题..."
        disabled={disabled}
        className="min-h-[132px] flex-1 resize-none rounded-lg border border-line bg-slate-900/80 px-4 py-3.5 text-sm text-slate-100 outline-none transition placeholder:text-soft focus:border-accent"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submitQuestion(event.currentTarget.form as HTMLFormElement);
          }
        }}
      />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
        发送
      </button>
    </form>
  );
}
