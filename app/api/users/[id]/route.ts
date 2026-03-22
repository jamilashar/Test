import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserId } from '@/lib/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      photos: true,
      gender: true,
      tags: true,
      bio: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getUserId();

  if (userId !== id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, bio, photos, tags, gender, profilePhoto } = body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(photos && { photos: JSON.stringify(photos) }),
      ...(tags && { tags: JSON.stringify(tags) }),
      ...(gender && { gender }),
      ...(profilePhoto && { profilePhoto }),
    },
  });

  return NextResponse.json({ id: user.id });
}
