'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TagBadge from '@/components/TagBadge';
import BottomNav from '@/components/BottomNav';

interface MatchUser {
  id: string;
  name: string;
  profilePhoto: string;
  tags: string;
  bio: string;
  instagramUrl: string;
}

interface Match {
  matchId: string;
  matchedAt: string;
  user: MatchUser;
}

function extractUsername(url: string): string {
  try {
    const cleaned = url.replace(/\/$/, '');
    return cleaned.split('/').pop() || url;
  } catch {
    return url;
  }
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matches')
      .then((r) => {
        if (!r.ok) { router.push('/'); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setMatches(data);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex flex-col h-full" style={{ height: '100dvh' }}>
      {/* Header */}
      <div
        className="flex-none px-6 pt-12 pb-6 text-white"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <h1 className="text-2xl font-black">Your Matches</h1>
        <p className="text-white/75 text-sm mt-1">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </p>
      </div>

      <div className="flex-1 overflow-auto pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
            <div className="text-6xl mb-4">💕</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No matches yet</h3>
            <p className="text-gray-500 text-sm mb-6">Keep swiping to find your match!</p>
            <button
              onClick={() => router.push('/swipe')}
              className="px-6 py-3 rounded-2xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              Start Swiping 🔥
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {matches.map((match) => {
              const tags = (() => { try { return JSON.parse(match.user.tags) as string[]; } catch { return []; } })();
              const username = extractUsername(match.user.instagramUrl);
              return (
                <div key={match.matchId} className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-none">
                      <Image
                        src={match.user.profilePhoto}
                        alt={match.user.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base">{match.user.name}</h3>
                      {match.user.bio && (
                        <p className="text-gray-500 text-sm truncate mt-0.5">{match.user.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tags.slice(0, 2).map((tag) => (
                          <TagBadge key={tag} tag={tag} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instagram link — revealed on match */}
                  <div className="mt-3 flex gap-2">
                    <a
                      href={match.user.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center text-white"
                      style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
                    >
                      📷 View Instagram
                    </a>
                    <a
                      href={`https://ig.me/m/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center text-purple-700 bg-purple-50 border border-purple-100"
                    >
                      💬 Send DM
                    </a>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Matched {new Date(match.matchedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
