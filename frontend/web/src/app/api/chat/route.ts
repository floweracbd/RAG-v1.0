import { NextRequest } from "next/server";
import { jsonError, proxyResponse, withBackendUrl } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.question || !body?.thread_id) {
    return jsonError("question 或 thread_id 缺失", 400);
  }

  const upstream = await fetch(withBackendUrl("/chat/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  return proxyResponse(upstream);
}
