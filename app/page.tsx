'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchedData, setFetchedData] = useState<{ name: string; photo: string | null } | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setFetchedData(null);

    try {
      const res = await fetch(`/api/instagram?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      setFetchedData(data);
    } catch {
      setError('Could not fetch Instagram profile. Please continue manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const params = new URLSearchParams({ instagramUrl: url.trim() });
    if (fetchedData?.name) params.set('name', fetchedData.name);
    if (fetchedData?.photo) params.set('photo', fetchedData.photo);
    router.push(`/setup?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-full overflow-auto" style={{ height: '100dvh' }}>
      {/* Hero */}
      <div
        className="flex-none flex flex-col items-center justify-center px-6 py-12 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="text-6xl mb-4">✨</div>
        <h1 className="text-4xl font-black mb-2">Glimpse</h1>
        <p className="text-white/80 text-base max-w-xs">
          Connect through Instagram. When you match, the link is revealed.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col px-6 py-8 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Instagram Profile URL
          </label>
          <input
            type="url"
            placeholder="https://instagram.com/yourusername"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none text-gray-800 text-base transition-colors"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!fetchedData ? (
          <button
            onClick={handleFetch}
            disabled={!url.trim() || loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-50 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            {loading ? 'Fetching...' : 'Fetch My Profile'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-50 border border-purple-100">
              {fetchedData.photo ? (
                <Image
                  src={fetchedData.photo}
                  alt={fetchedData.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-purple-200 flex items-center justify-center text-2xl">
                  👤
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{fetchedData.name}</p>
                <p className="text-sm text-gray-500">Profile found ✓</p>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              Continue to Setup →
            </button>

            <button
              onClick={() => setFetchedData(null)}
              className="w-full py-3 text-gray-500 text-sm"
            >
              Try a different URL
            </button>
          </div>
        )}

        {!fetchedData && url.trim() && error && (
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-2xl font-semibold text-purple-600 border-2 border-purple-200 text-base"
          >
            Continue Without Fetching
          </button>
        )}

        <div className="mt-auto pt-4 text-center text-xs text-gray-400 space-y-1">
          <p>🔒 Your Instagram URL is only shown to people you match with</p>
          <p>No Instagram account required to browse</p>
        </div>
      </div>
    </div>
  );
}
