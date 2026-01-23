// lib/logging.ts
export function logUnauthorizedAccess(session: any) {
  console.warn('Unauthorized access attempt:', session);
}