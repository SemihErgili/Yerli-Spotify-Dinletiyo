import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('users')
      .update({ preferences })
      .eq('id', userId);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Kullanıcı tercihleri kaydedildi.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ preferences: { artists: [], genres: [] } });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      return NextResponse.json({ preferences: { artists: [], genres: [] } });
    }
    
    return NextResponse.json({ preferences: user.preferences || { artists: [], genres: [] } });
  } catch (error: any) {
    return NextResponse.json({ preferences: { artists: [], genres: [] } });
  }
}
