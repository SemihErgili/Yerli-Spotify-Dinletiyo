import { NextRequest, NextResponse } from 'next/server';
import { addRecentlyPlayedSong, getRecentlyPlayedSongs } from '@/lib/auth';

// Son çalınan şarkıları getir
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }
    
    const recentlyPlayed = await getRecentlyPlayedSongs(userId);
    return NextResponse.json({ recentlyPlayed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Son çalınan şarkı ekle
export async function POST(request: NextRequest) {
  try {
    const { userId, song } = await request.json();
    
    if (!userId || !song) {
      return NextResponse.json({ error: 'Kullanıcı ID ve şarkı bilgileri gerekli' }, { status: 400 });
    }
    
    const result = await addRecentlyPlayedSong(userId, song);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}