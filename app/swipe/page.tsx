'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from '@/components/SwipeCard';
import MatchModal from '@/components/MatchModal';
import BottomNav from '@/components/BottomNav';

interface Profile {
  id: string;
  name: string;
  profilePhoto: string;
  photos: string;
  gender: string;
  tags: string;
  bio: string;
}

interface MatchedUser {
  name: string;
  profilePhoto: string;
  instagramUrl: string;
}

export default function SwipePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [genderFilter, setGenderFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [myPhoto, setMyPhoto] = useState('');
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);

  useEffect(() => {
    // Get my profile photo
    fetch('/api/users')
      .then((r) => r.json())
      .then((user) => {
        if (!user) {
          router.push('/');
          return;
        }
        setMyPhoto(user.profilePhoto);
      })
      .catch(() => router.push('/'));
  }, [router]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?gender=${genderFilter}`);
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setProfiles(data);
      setCurrentIndex(0);
      setNoMoreProfiles(data.length === 0);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [genderFilter, router]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleAction = async (action: 'like' | 'pass') => {
    const profile = profiles[currentIndex];
    if (!profile) return;

    if (action === 'like') {
      try {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toUserId: profile.id, action: 'like' }),
        });
        const data = await res.json();
        if (data.matched) {
          setMatchedUser(data.matchedUser);
          setShowMatch(true);
        }
      } catch {
        // Continue anyway
      }
    } else {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: profile.id, action: 'pass' }),
      }).catch(() => {});
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= profiles.length) {
      // Try to load more
      await loadFeed();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="flex flex-col h-full" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 pt-12 pb-3">
        <h1 className="text-2xl font-black" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Glimpse ✨
        </h1>

        {/* Gender filter */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'male', label: '♂' },
            { key: 'female', label: '♀' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setGenderFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                genderFilter === key ? 'bg-white shadow text-purple-600' : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 relative mx-4 mb-2">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3 animate-spin">✨</div>
              <p className="text-gray-400 font-medium">Finding people...</p>
            </div>
          </div>
        ) : noMoreProfiles || !currentProfile ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">You&apos;ve seen everyone!</h3>
              <p className="text-gray-500 text-sm mb-6">Check back later for new people in your area</p>
              <button
                onClick={loadFeed}
                className="px-6 py-3 rounded-2xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {profiles.slice(currentIndex, currentIndex + 2).map((profile, i) => (
              <SwipeCard
                key={profile.id}
                profile={profile}
                onLike={() => handleAction('like')}
                onPass={() => handleAction('pass')}
                isTop={i === 0}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Action buttons */}
      {!loading && currentProfile && (
        <div className="flex-none flex items-center justify-center gap-6 pb-24 px-6">
          <button
            onClick={() => handleAction('pass')}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl border border-gray-100 active:scale-95 transition-transform"
          >
            ✕
          </button>
          <button
            onClick={() => handleAction('like')}
            className="w-20 h-20 rounded-full shadow-lg flex items-center justify-center text-3xl active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            💕
          </button>
          <button
            onClick={() => handleAction('pass')}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl border border-gray-100 active:scale-95 transition-transform opacity-0 pointer-events-none"
          >
            ⭐
          </button>
        </div>
      )}

      <BottomNav />

      <MatchModal
        isOpen={showMatch}
        matchedUser={matchedUser}
        myPhoto={myPhoto}
        onClose={() => setShowMatch(false)}
      />
    </div>
  );
}
