import { proxyResponse, withBackendUrl } from "@/lib/backend";

export const dynamic = "force-dynamic";

type Params = {
  params: {
    threadId: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  const upstream = await fetch(withBackendUrl(`/history/history/${params.threadId}`), {
    method: "POST",
    cache: "no-store"
  });

  return proxyResponse(upstream);
}
