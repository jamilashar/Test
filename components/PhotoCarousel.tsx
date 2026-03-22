'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PhotoCarouselProps {
  photos: string[];
  profilePhoto: string;
  name: string;
}

export default function PhotoCarousel({ photos, profilePhoto, name }: PhotoCarouselProps) {
  const allPhotos = [profilePhoto, ...photos].filter(Boolean);
  const [current, setCurrent] = useState(0);

  const handleTap = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) {
      setCurrent((c) => Math.min(c + 1, allPhotos.length - 1));
    } else {
      setCurrent((c) => Math.max(c - 1, 0));
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden" onClick={handleTap}>
      {allPhotos.map((photo, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-300 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={photo}
            alt={`${name} photo ${i + 1}`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ))}

      {/* Dots indicator */}
      {allPhotos.length > 1 && (
        <div className="absolute top-2 left-0 right-0 flex justify-center gap-1 z-10">
          {allPhotos.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === current ? 'bg-white w-6' : 'bg-white/50 w-3'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
