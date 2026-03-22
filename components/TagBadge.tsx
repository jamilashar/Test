'use client';

const TAG_CONFIG: Record<string, { label: string; color: string }> = {
  date: { label: '💕 Looking to Date', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  friend: { label: '🤝 Looking for a Friend', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  business: { label: '💼 Business Connection', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

interface TagBadgeProps {
  tag: string;
  size?: 'sm' | 'md';
}

export default function TagBadge({ tag, size = 'md' }: TagBadgeProps) {
  const config = TAG_CONFIG[tag] ?? { label: tag, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
}
