'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

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

function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialName = searchParams.get('name') || '';
  const initialPhoto = searchParams.get('photo') || '';
  const instagramUrl = searchParams.get('instagramUrl') || '';

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState(initialPhoto);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const profileInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const { path } = await res.json();
    return path;
  };

  const handleProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = await uploadFile(file);
      setProfilePhoto(path);
    } catch {
      setError('Failed to upload profile photo');
    }
  };

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    try {
      const paths = await Promise.all(files.map(uploadFile));
      setPhotos(paths);
    } catch {
      setError('Failed to upload photos');
    }
  };

  const toggleTag = (key: string) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!gender) return setError('Please select your gender');
    if (selectedTags.length === 0) return setError('Please select at least one tag');
    if (!instagramUrl) return setError('Instagram URL is missing. Go back and try again.');

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagramUrl,
          name: name.trim(),
          profilePhoto,
          photos,
          gender,
          tags: selectedTags,
          bio: bio.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to create profile');
      router.push('/swipe');
    } catch (e) {
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto pb-8" style={{ height: '100dvh' }}>
      {/* Header */}
      <div
        className="flex-none px-6 pt-12 pb-6 text-white"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <h1 className="text-2xl font-black">Complete Your Profile</h1>
        <p className="text-white/75 text-sm mt-1">Let people know who you are</p>
      </div>

      <div className="flex-1 px-6 pt-6 space-y-6">
        {/* Profile photo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer border-4 border-purple-200 relative"
            onClick={() => profileInputRef.current?.click()}
          >
            {profilePhoto ? (
              <Image src={profilePhoto} alt="Profile" fill className="object-cover" unoptimized />
            ) : (
              <span className="text-4xl">📸</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => profileInputRef.current?.click()}
            className="text-purple-600 text-sm font-semibold"
          >
            {profilePhoto ? 'Change Profile Photo' : 'Add Profile Photo'}
          </button>
          <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none text-base"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell people a bit about yourself..."
            rows={3}
            maxLength={150}
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none text-base resize-none"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{bio.length}/150</p>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">I am</label>
          <div className="flex gap-2">
            {GENDERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setGender(key)}
                className={`flex-1 py-3 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  gender === key
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">I&apos;m on Glimpse for</label>
          <div className="space-y-2">
            {TAGS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleTag(key)}
                className={`w-full py-3.5 px-4 rounded-2xl text-sm font-semibold border-2 text-left transition-all flex items-center justify-between ${
                  selectedTags.includes(key)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <span>{label}</span>
                {selectedTags.includes(key) && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Showcase photos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            3 Showcase Photos <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 aspect-square rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-200 relative"
                onClick={() => photosInputRef.current?.click()}
              >
                {photos[i] ? (
                  <Image src={photos[i]} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-2xl text-gray-300">+</span>
                )}
              </div>
            ))}
          </div>
          <input
            ref={photosInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotos}
          />
          <p className="text-xs text-gray-400 mt-2 text-center">Tap to upload up to 3 photos</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
        >
          {loading ? 'Creating Profile...' : 'Start Swiping 🔥'}
        </button>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading...</div>}>
      <SetupForm />
    </Suspense>
  );
}
