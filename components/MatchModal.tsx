'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MatchedUser {
  name: string;
  profilePhoto: string;
  instagramUrl: string;
}

interface MatchModalProps {
  isOpen: boolean;
  matchedUser: MatchedUser | null;
  myPhoto: string;
  onClose: () => void;
}

function extractUsername(url: string): string {
  try {
    const cleaned = url.replace(/\/$/, '');
    return cleaned.split('/').pop() || url;
  } catch {
    return url;
  }
}

export default function MatchModal({ isOpen, matchedUser, myPhoto, onClose }: MatchModalProps) {
  if (!matchedUser) return null;
  const username = extractUsername(matchedUser.instagramUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-purple-900/95" />

          {/* Particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-pink-400/60"
                initial={{ x: '50%', y: '50%', scale: 0 }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, delay: i * 0.1, ease: 'easeOut' }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            {/* Title */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-white/70 text-lg font-medium mb-1">You and</p>
              <h2 className="text-5xl font-bold text-white mb-1">
                It&apos;s a
              </h2>
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">
                Match!
              </h2>
            </motion.div>

            {/* Photos */}
            <motion.div
              className="flex items-center mt-8 mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl z-10">
                <Image src={myPhoto} alt="You" fill className="object-cover" unoptimized />
              </div>
              <div className="text-3xl -mx-2 z-20 drop-shadow-lg">💕</div>
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl z-10">
                <Image src={matchedUser.profilePhoto} alt={matchedUser.name} fill className="object-cover" unoptimized />
              </div>
            </motion.div>

            <motion.p
              className="text-white/80 text-base mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              You both liked each other! Connect via Instagram DM.
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="flex flex-col gap-3 w-full max-w-xs"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <a
                href={`https://ig.me/m/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl font-bold text-white text-center"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                Message on Instagram
              </a>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-semibold text-white/80 border border-white/20"
              >
                Keep Swiping
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
