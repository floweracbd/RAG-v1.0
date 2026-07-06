import Link from "next/link";
import { Bot, DatabaseZap, LayoutDashboard, MessageSquareText } from "lucide-react";

const links = [
  { href: "/", label: "工作台", icon: LayoutDashboard },
  { href: "/knowledge", label: "知识库", icon: DatabaseZap },
  { href: "/chat", label: "问答台", icon: MessageSquareText }
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-grid text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-64 shrink-0 rounded-lg border border-line bg-panel/80 p-4 shadow-panel backdrop-blur lg:block">
          <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">电商客服 RAG</p>
              <p className="text-xs text-soft">Knowledge Workspace</p>
            </div>
          </div>

          <nav className="space-y-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm text-slate-300 transition hover:border-line hover:bg-slate-900/60 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-line bg-slate-950/50 p-4 text-xs text-soft">
            <p className="font-medium text-slate-200">接口对接</p>
            <p className="mt-2 leading-6">Next Route Handlers 代理现有 FastAPI，前端不直接跨域请求后端。</p>
          </div>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
