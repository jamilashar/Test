'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import PhotoCarousel from './PhotoCarousel';
import TagBadge from './TagBadge';

interface Profile {
  id: string;
  name: string;
  profilePhoto: string;
  photos: string;
  gender: string;
  tags: string;
  bio: string;
}

interface SwipeCardProps {
  profile: Profile;
  onLike: () => void;
  onPass: () => void;
  isTop: boolean;
}

export default function SwipeCard({ profile, onLike, onPass, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);
  const [isDragging, setIsDragging] = useState(false);

  const photos = (() => {
    try { return JSON.parse(profile.photos) as string[]; } catch { return []; }
  })();
  const tags = (() => {
    try { return JSON.parse(profile.tags) as string[]; } catch { return []; }
  })();

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    setIsDragging(false);
    if (info.offset.x > 100) {
      onLike();
    } else if (info.offset.x < -100) {
      onPass();
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-white relative">
        {/* Photo carousel */}
        <div className="absolute inset-0">
          <PhotoCarousel photos={photos} profilePhoto={profile.profilePhoto} name={profile.name} />
        </div>

        {/* Like overlay */}
        <motion.div
          className="absolute inset-0 bg-green-500/30 flex items-center justify-center rounded-3xl"
          style={{ opacity: likeOpacity }}
        >
          <div className="border-4 border-green-500 rounded-2xl px-6 py-3 rotate-[-20deg]">
            <span className="text-green-500 text-4xl font-black tracking-widest">LIKE</span>
          </div>
        </motion.div>

        {/* Pass overlay */}
        <motion.div
          className="absolute inset-0 bg-red-500/30 flex items-center justify-center rounded-3xl"
          style={{ opacity: passOpacity }}
        >
          <div className="border-4 border-red-500 rounded-2xl px-6 py-3 rotate-[20deg]">
            <span className="text-red-500 text-4xl font-black tracking-widest">NOPE</span>
          </div>
        </motion.div>

        {/* Bottom gradient + info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 rounded-b-3xl">
          <h2 className="text-white text-2xl font-bold">{profile.name}</h2>
          {profile.bio && (
            <p className="text-white/80 text-sm mt-1 line-clamp-2">{profile.bio}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white font-medium backdrop-blur-sm"
              >
                {tag === 'date' ? '💕 Date' : tag === 'friend' ? '🤝 Friend' : '💼 Business'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
