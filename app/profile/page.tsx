'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TagBadge from '@/components/TagBadge';
import BottomNav from '@/components/BottomNav';

const TAGS = [
  { key: 'date', label: '💕 Looking to Date' },
  { key: 'friend', label: '🤝 Looking for a Friend' },
  { key: 'business', label: '💼 Business Connection' },
];

const GENDERS = [
  { key: 'male', label: '♂ Male' },
  { key: 'female', label: '♀ Female' },
  { key: 'other', label: '⚧ Other' },
];

interface UserProfile {
  id: string;
  name: string;
  profilePhoto: string;
  photos: string;
  gender: string;
  tags: string;
  bio: string;
  instagramUrl: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => {
        if (!r.ok) { router.push('/'); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) { router.push('/'); return; }
        setUser(data);
        setName(data.name);
        setBio(data.bio);
        setGender(data.gender);
        try { setSelectedTags(JSON.parse(data.tags)); } catch { setSelectedTags([]); }
      });
  }, [router]);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const { path } = await res.json();
    return path;
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const path = await uploadFile(file);
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhoto: path }),
      });
      setUser({ ...user, profilePhoto: path });
    } catch {
      setError('Failed to update photo');
    }
  };

  const toggleTag = (key: string) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) return setError('Name is required');
    setSaving(true);
    setError('');
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim(), gender, tags: selectedTags }),
      });
      setUser({ ...user, name: name.trim(), bio: bio.trim(), gender, tags: JSON.stringify(selectedTags) });
      setEditing(false);
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const photos = (() => { try { return JSON.parse(user.photos) as string[]; } catch { return []; } })();
  const tags = (() => { try { return JSON.parse(user.tags) as string[]; } catch { return []; } })();

  return (
    <div className="flex flex-col h-full" style={{ height: '100dvh' }}>
      {/* Header */}
      <div
        className="flex-none px-6 pt-12 pb-6 text-white flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <h1 className="text-2xl font-black">My Profile</h1>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold"
        >
          {editing ? (saving ? 'Saving...' : 'Save') : 'Edit'}
        </button>
      </div>

      <div className="flex-1 overflow-auto pb-24">
        {/* Profile photo */}
        <div className="flex flex-col items-center py-6 bg-white">
          <div
            className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-purple-100 shadow cursor-pointer"
            onClick={() => editing && photoInputRef.current?.click()}
          >
            <Image src={user.profilePhoto} alt={user.name} fill className="object-cover" unoptimized />
            {editing && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-white text-2xl">📸</span>
              </div>
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-3 text-xl font-bold text-center border-b-2 border-purple-300 outline-none px-2"
            />
          ) : (
            <h2 className="mt-3 text-xl font-bold text-gray-900">{user.name}</h2>
          )}

          <p className="text-sm text-gray-400 mt-1">@{user.instagramUrl.split('/').pop()}</p>
        </div>

        <div className="px-5 space-y-5 pt-4">
          {/* Bio */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bio</h3>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={150}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none text-sm resize-none"
              />
            ) : (
              <p className="text-gray-600 text-sm">{user.bio || 'No bio yet'}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">I am</h3>
            {editing ? (
              <div className="flex gap-2">
                {GENDERS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setGender(key)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      gender === key ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-700 font-medium capitalize">{user.gender}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Looking for</h3>
            {editing ? (
              <div className="space-y-2">
                {TAGS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleTag(key)}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold border-2 text-left flex items-center justify-between ${
                      selectedTags.includes(key) ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {label}
                    {selectedTags.includes(key) && <span>✓</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
                {tags.length === 0 && <p className="text-gray-400 text-sm">No tags set</p>}
              </div>
            )}
          </div>

          {/* Showcase photos */}
          {photos.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Photos</h3>
              <div className="flex gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="flex-1 aspect-square rounded-2xl overflow-hidden relative">
                    <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="w-full py-3 text-gray-500 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
