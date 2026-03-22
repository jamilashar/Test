import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserId } from '@/lib/session';

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          tags: true,
          bio: true,
          instagramUrl: true,
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          tags: true,
          bio: true,
          instagramUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Return the "other" user in each match
  const result = matches.map((match) => {
    const other = match.user1Id === userId ? match.user2 : match.user1;
    return {
      matchId: match.id,
      matchedAt: match.createdAt,
      user: other,
    };
  });

  return NextResponse.json(result);
}
