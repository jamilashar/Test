import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserId } from '@/lib/session';

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { toUserId, action } = await request.json();
  if (!toUserId || !action) {
    return NextResponse.json({ error: 'Missing toUserId or action' }, { status: 400 });
  }

  // Upsert the like/pass
  await prisma.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: userId, toUserId } },
    create: { fromUserId: userId, toUserId, action },
    update: { action },
  });

  if (action === 'like') {
    // Check if there's a mutual like
    const reverseLike = await prisma.like.findFirst({
      where: { fromUserId: toUserId, toUserId: userId, action: 'like' },
    });

    if (reverseLike) {
      // Check if match already exists
      const existingMatch = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: toUserId },
            { user1Id: toUserId, user2Id: userId },
          ],
        },
      });

      if (!existingMatch) {
        await prisma.match.create({
          data: { user1Id: userId, user2Id: toUserId },
        });
      }

      // Return matched user's info including Instagram URL
      const matchedUser = await prisma.user.findUnique({
        where: { id: toUserId },
        select: { name: true, profilePhoto: true, instagramUrl: true },
      });

      return NextResponse.json({ matched: true, matchedUser });
    }
  }

  return NextResponse.json({ matched: false });
}
