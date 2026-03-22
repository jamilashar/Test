import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  try {
    // Try Instagram oEmbed API
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}&maxwidth=400`;
    const response = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        name: data.author_name || extractUsername(url),
        photo: data.thumbnail_url || null,
      });
    }
  } catch {
    // Fall through to username extraction
  }

  // Fallback: extract username from URL
  const username = extractUsername(url);
  return NextResponse.json({
    name: username,
    photo: null,
  });
}

function extractUsername(url: string): string {
  try {
    const cleaned = url.replace(/\/$/, '');
    const parts = cleaned.split('/');
    const username = parts[parts.length - 1];
    return username || url;
  } catch {
    return url;
  }
}
