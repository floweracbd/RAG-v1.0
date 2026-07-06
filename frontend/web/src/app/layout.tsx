import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "电商客服 RAG 工作台",
  description: "面向电商客服场景的知识库管理与智能问答工作台"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
