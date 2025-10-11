import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'register') {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .or(`email.eq.${data.email},username.eq.${data.username}`)
        .single();
      
      if (existingUser) {
        return NextResponse.json({ error: 'Bu e-posta adresi veya kullanıcı adı zaten kullanılıyor.' }, { status: 400 });
      }
      
      const newUser = {
        id: Date.now().toString(),
        username: data.username,
        email: data.email,
        password: data.password,
        registered_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('users')
        .insert(newUser);
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      // Kayıt başarılı, kullanıcı bilgilerini döndür (şifre hariç)
      const { password, ...userWithoutPassword } = newUser;
      return NextResponse.json(userWithoutPassword);
    }

    if (action === 'login') {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email)
        .single();
      
      if (error || !user) {
        return NextResponse.json({ error: 'Böyle bir kullanıcı bulunamadı.' }, { status: 400 });
      }
      
      if (user.password !== data.password) {
        return NextResponse.json({ error: 'Şifre yanlış.' }, { status: 400 });
      }
      
      const { password, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, registered_at, avatar');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
