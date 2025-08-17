export async function fetchJSON<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
    // @ts-ignore Next.js runtime hint to fully bypass ISR for this call
    next: { revalidate: 0 },
    ...init,
    headers: { ...(init.headers || {}), Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return (await res.json()) as T;
}


