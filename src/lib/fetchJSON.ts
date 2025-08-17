export async function fetchJSON<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: { ...(init.headers || {}), Accept: 'application/json' },
  } as RequestInit);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return (await res.json()) as T;
}


