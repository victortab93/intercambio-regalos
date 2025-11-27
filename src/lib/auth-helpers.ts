// src/lib/auth-helpers.ts
import { cookies } from 'next/headers';
import { verifySession } from './auth';

export async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) return null;

  try {
    return verifySession(token);
  } catch {
    return null;
  }
}
