export async function getServerNow(baseUrl: string): Promise<Date> {
  try {
    // Use HEAD to read server Date header; fallback to client clock
    // @ts-ignore disable ISR on this request
    const res = await fetch(`${baseUrl}/`, { method: 'HEAD', cache: 'no-store', next: { revalidate: 0 } } as any);
    const hdr = res.headers?.get('date');
    return hdr ? new Date(hdr) : new Date();
  } catch {
    return new Date();
  }
}


