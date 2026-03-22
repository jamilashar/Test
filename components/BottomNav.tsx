'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/swipe', label: 'Discover', icon: '🔥' },
  { href: '/matches', label: 'Matches', icon: '💕' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                active ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className={`text-xs font-medium ${active ? 'text-purple-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
