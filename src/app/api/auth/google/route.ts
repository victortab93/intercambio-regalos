// src/app/api/auth/google/route.ts
import { NextResponse } from 'next/server';
import { UserService } from '@/core/users/user.service';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const invite = new URL(req.url).searchParams.get('invite') ?? undefined;

    const result = await UserService.loginWithGoogle({ ...body, invite });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    const { token, user } = result.value;

    const cookieStore = cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30
    });

    return NextResponse.json({ ok: true, user });

  } catch (error) {
    console.error('Google login route error:', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
