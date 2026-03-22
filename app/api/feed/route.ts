import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserId } from '@/lib/session';

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const genderFilter = request.nextUrl.searchParams.get('gender');

  // Get IDs of users already acted on
  const actedOn = await prisma.like.findMany({
    where: { fromUserId: userId },
    select: { toUserId: true },
  });
  const actedIds = actedOn.map((l) => l.toUserId);
  actedIds.push(userId); // exclude self

  const whereClause: {
    id: { notIn: string[] };
    gender?: string;
  } = {
    id: { notIn: actedIds },
  };

  if (genderFilter && genderFilter !== 'all') {
    whereClause.gender = genderFilter;
  }

  const profiles = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      photos: true,
      gender: true,
      tags: true,
      bio: true,
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(profiles);
}
