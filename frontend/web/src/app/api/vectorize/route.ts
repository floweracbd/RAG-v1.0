import { NextRequest } from "next/server";
import { jsonError, proxyResponse, withBackendUrl } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const documentId = Number(body?.documentId);

  if (!Number.isFinite(documentId) || documentId <= 0) {
    return jsonError("documentId 无效", 400);
  }

  const upstream = await fetch(withBackendUrl(`/upload/save?document_id=${documentId}`), {
    method: "GET",
    cache: "no-store"
  });

  return proxyResponse(upstream);
}
