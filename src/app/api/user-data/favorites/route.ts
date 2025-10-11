import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Favori şarkıları getir
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ favorites: [] });
    }
    
    const { data, error } = await supabase
      .from('favorites')
      .select('song_data')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ favorites: [] });
    }
    
    const favorites = data?.map(item => item.song_data) || [];
    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ favorites: [] });
  }
}

// Favori şarkı ekle
export async function POST(request: NextRequest) {
  try {
    const { userId, song } = await request.json();
    
    if (!userId || !song) {
      return NextResponse.json({ error: 'Kullanıcı ID ve şarkı bilgileri gerekli' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('favorites')
      .upsert({ 
        user_id: userId, 
        song_id: song.id, 
        song_data: song 
      }, {
        onConflict: 'user_id,song_id'
      });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Şarkı favorilere eklendi.' });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Favori şarkı kaldır
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const songId = request.nextUrl.searchParams.get('songId');
    
    if (!userId || !songId) {
      return NextResponse.json({ error: 'Kullanıcı ID ve şarkı ID gerekli' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', songId);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Şarkı favorilerden kaldırıldı.' });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}