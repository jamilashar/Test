import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserId, setUserIdCookie } from '@/lib/session';

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(null);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      photos: true,
      gender: true,
      tags: true,
      bio: true,
      instagramUrl: true,
    },
  });

  return NextResponse.json(user);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { instagramUrl, name, profilePhoto, photos, gender, tags, bio } = body;

  if (!instagramUrl || !name || !gender) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if user with this Instagram URL already exists
  const existing = await prisma.user.findUnique({ where: { instagramUrl } });
  if (existing) {
    // Log them back in
    const response = NextResponse.json({ id: existing.id, existing: true });
    setUserIdCookie(response, existing.id);
    return response;
  }

  const user = await prisma.user.create({
    data: {
      instagramUrl,
      name,
      profilePhoto: profilePhoto || '/placeholder-avatar.svg',
      photos: JSON.stringify(photos || []),
      gender,
      tags: JSON.stringify(tags || []),
      bio: bio || '',
    },
  });

  const response = NextResponse.json({ id: user.id });
  setUserIdCookie(response, user.id);
  return response;
}
