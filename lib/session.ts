import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'glimpse_session';

export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export function setUserIdCookie(response: NextResponse, userId: string): void {
  response.cookies.set(COOKIE_NAME, userId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  });
}

export function clearUserIdCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}
