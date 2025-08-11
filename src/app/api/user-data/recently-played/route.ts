import { NextRequest, NextResponse } from 'next/server';
import { addRecentlyPlayedSong, getRecentlyPlayedSongs } from '@/lib/auth';

// Son çalınan şarkıları getir
export async function GET(request: NextRequest) {
  return NextResponse.json({ recentlyPlayed: [] });
}

// Son çalınan şarkı ekle
export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'Son çalınan şarkı eklendi.' });
}