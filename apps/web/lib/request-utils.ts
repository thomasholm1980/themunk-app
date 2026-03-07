// apps/web/lib/request-utils.ts
// Shared identity and date resolution for all API routes

export function resolveUserId(request: Request): string {
  return (request as unknown as { headers: { get: (k: string) => string | null } })
    .headers.get('x-user-id') ?? 'thomas';
}

export function getOsloDateKey(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
