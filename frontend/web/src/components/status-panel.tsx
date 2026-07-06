import { CheckCircle2, Clock3, Loader2, OctagonAlert, Radio } from "lucide-react";
import type { ActionState } from "@/lib/types";

type StatusPanelProps = {
  backendOnline: boolean;
  documentCount: number;
  selectedDocumentId: number | null;
  threadId: string;
  lastAction: ActionState;
};

function StatusIcon({ kind }: { kind: ActionState["kind"] }) {
  if (kind === "working") {
    return <Loader2 className="h-4 w-4 animate-spin text-accent" />;
  }
  if (kind === "success") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  }
  if (kind === "error") {
    return <OctagonAlert className="h-4 w-4 text-rose-400" />;
  }
  return <Clock3 className="h-4 w-4 text-soft" />;
}

export function StatusPanel(props: StatusPanelProps) {
  const items = [
    { label: "后端状态", value: props.backendOnline ? "在线" : "离线" },
    { label: "知识库文档数", value: String(props.documentCount) },
    { label: "当前文档", value: props.selectedDocumentId ? `#${props.selectedDocumentId}` : "未选择" },
    { label: "当前会话", value: props.threadId }
  ];

  return (
    <section className="rounded-lg border border-line bg-panel/85 p-5 shadow-panel backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">系统状态</p>
          <p className="mt-1 text-xs text-soft">后端代理、文档数量与会话上下文</p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${props.backendOnline ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
          <Radio className="h-3.5 w-3.5" />
          {props.backendOnline ? "Backend Ready" : "Backend Down"}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-line bg-slate-950/40 px-3 py-3">
            <dt className="text-xs text-soft">{item.label}</dt>
            <dd className="mt-1 break-all text-sm font-medium text-slate-100">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-lg border border-line bg-slate-950/40 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
          <StatusIcon kind={props.lastAction.kind} />
          <span>{props.lastAction.title}</span>
        </div>
        {props.lastAction.detail ? <p className="mt-2 text-sm leading-6 text-slate-300">{props.lastAction.detail}</p> : null}
        {props.lastAction.time ? <p className="mt-2 text-xs text-soft">{props.lastAction.time}</p> : null}
      </div>
    </section>
  );
}
