"use client";

import { Loader2, RefreshCw, UploadCloud } from "lucide-react";
import type { DocumentItem, UploadResponse } from "@/lib/types";

type KnowledgePanelProps = {
  documents: DocumentItem[];
  selectedDocumentId: number | null;
  isUploading: boolean;
  isVectorizing: boolean;
  uploadResult: UploadResponse | null;
  onSelectDocument: (documentId: number) => void;
  onRefreshDocuments: () => void;
  onUploadFile: (file: File) => void;
  onVectorizeDocument: (documentId: number) => void;
};

export function KnowledgePanel(props: KnowledgePanelProps) {
  return (
    <section className="rounded-lg border border-line bg-panel/85 p-5 shadow-panel backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">知识库管理</p>
          <p className="mt-1 text-xs text-soft">上传文档、记录 document_id，并触发向量化入库。</p>
        </div>
        <button
          type="button"
          onClick={props.onRefreshDocuments}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-slate-950/50 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          刷新列表
        </button>
      </div>

      <label className="mt-5 flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-slate-600 bg-slate-950/35 px-4 py-4 transition hover:border-accent/60 hover:bg-slate-900/70">
        <div>
          <p className="text-sm font-medium text-slate-100">上传知识库文件</p>
          <p className="mt-1 text-xs text-soft">支持 pdf、docx、md、csv、txt</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950">
          <UploadCloud className="h-4 w-4" />
          选择文件
        </div>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.md,.csv,.txt"
          disabled={props.isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              props.onUploadFile(file);
              event.currentTarget.value = "";
            }
          }}
        />
      </label>

      {props.uploadResult ? (
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <p className="font-medium">已上传：{props.uploadResult.filename}</p>
          <p className="mt-1">document_id: #{props.uploadResult.id}</p>
          <p className="mt-1 text-emerald-100/80">{props.uploadResult.message}</p>
        </div>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-lg border border-line">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-soft">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">文件</th>
              <th className="px-4 py-3 font-medium">类型</th>
              <th className="px-4 py-3 font-medium">MD5</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-slate-950/20 text-slate-200">
            {props.documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-soft">
                  当前没有文档记录。
                </td>
              </tr>
            ) : (
              props.documents.map((document) => {
                const selected = props.selectedDocumentId === document.id;

                return (
                  <tr key={document.id} className={selected ? "bg-accent/10" : "hover:bg-slate-900/40"}>
                    <td className="px-4 py-3 align-top font-medium text-slate-100">#{document.id}</td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-slate-100">{document.file_name}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-soft">{document.file_type}</td>
                    <td className="max-w-[280px] truncate px-4 py-3 align-top text-soft">{document.file_md5}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => props.onSelectDocument(document.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${selected ? "bg-accent text-slate-950" : "border border-line bg-slate-950/40 text-slate-200 hover:border-slate-500"}`}
                        >
                          选中
                        </button>
                        <button
                          type="button"
                          onClick={() => props.onVectorizeDocument(document.id)}
                          disabled={props.isVectorizing}
                          className="inline-flex items-center gap-2 rounded-lg border border-line bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {props.isVectorizing && selected ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          写入向量库
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
