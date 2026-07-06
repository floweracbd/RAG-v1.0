const STORAGE_KEY = "ecommerce-rag-agent-thread-id";

function createThreadId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `thread-${Date.now()}`;
}

export function getOrCreateThreadId() {
  if (typeof window === "undefined") {
    return createThreadId();
  }

  const cached = window.sessionStorage.getItem(STORAGE_KEY);
  if (cached) {
    return cached;
  }

  const nextId = createThreadId();
  window.sessionStorage.setItem(STORAGE_KEY, nextId);
  return nextId;
}

export function rotateThreadId() {
  const nextId = createThreadId();

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, nextId);
  }

  return nextId;
}
