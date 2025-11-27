// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ ok: false, user: null });
    }

    const payload = verifySession(token);

    return NextResponse.json({ ok: true, user: payload });

  } catch (err) {
    console.error('Me route error:', err);
    return NextResponse.json({ ok: false, user: null });
  }
}
