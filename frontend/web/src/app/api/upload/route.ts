import { NextRequest } from "next/server";
import { proxyResponse, withBackendUrl } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const upstream = await fetch(withBackendUrl("/upload/upload"), {
    method: "POST",
    body: formData,
    cache: "no-store"
  });

  return proxyResponse(upstream);
}
