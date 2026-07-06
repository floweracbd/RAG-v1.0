import { NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL ?? "http://127.0.0.1:8000";

export function withBackendUrl(path: string) {
  return `${BACKEND_BASE_URL}${path}`;
}

export async function proxyResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "application/json; charset=utf-8";
  const bodyText = await response.text();

  return new NextResponse(bodyText, {
    status: response.status,
    headers: {
      "content-type": contentType
    }
  });
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json({ detail: message }, { status });
}
