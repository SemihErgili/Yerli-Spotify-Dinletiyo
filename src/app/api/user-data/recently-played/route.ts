import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Son çalınan şarkıları getir
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ recentlyPlayed: [] });
    }
    
    const { data, error } = await supabase
      .from('recently_played')
      .select('song_data')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ recentlyPlayed: [] });
    }
    
    const recentlyPlayed = data?.map(item => item.song_data) || [];
    return NextResponse.json({ recentlyPlayed });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ recentlyPlayed: [] });
  }
}

// Son çalınan şarkı ekle
export async function POST(request: NextRequest) {
  try {
    const { userId, song } = await request.json();
    
    if (!userId || !song) {
      return NextResponse.json({ error: 'Kullanıcı ID ve şarkı bilgileri gerekli' }, { status: 400 });
    }
    
    // Önce aynı şarkıyı sil (eğer varsa)
    await supabase
      .from('recently_played')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', song.id);
    
    // Yeni kayıt ekle
    const { error } = await supabase
      .from('recently_played')
      .insert({ 
        user_id: userId, 
        song_id: song.id, 
        song_data: song,
        played_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Son çalınan şarkı eklendi.' });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}