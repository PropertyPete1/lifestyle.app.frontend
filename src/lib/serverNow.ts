export async function getServerNow(baseUrl: string): Promise<Date> {
  try {
    const res = await fetch(`${baseUrl}/`, { method: 'HEAD', cache: 'no-store' } as RequestInit);
    const hdr = res.headers?.get('date');
    return hdr ? new Date(hdr) : new Date();
  } catch {
    return new Date();
  }
}


