import { proxyResponse, withBackendUrl } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  const upstream = await fetch(withBackendUrl("/list/list"), {
    method: "GET",
    cache: "no-store"
  });

  return proxyResponse(upstream);
}
