import { NextResponse } from 'next/server';

// Memory-based kullanıcı sistemi (Vercel için)
let globalUsers: any[] = [
  { id: '1', username: 'admin', email: 'admin@dinletiyo.com', password: '123456', registeredAt: '2025-01-01T00:00:00.000Z' },
  { id: '2', username: 'demo', email: 'demo@dinletiyo.com', password: '123456', registeredAt: '2025-01-01T00:00:00.000Z' },
  { id: '3', username: 'test', email: 'test@dinletiyo.com', password: '123456', registeredAt: '2025-01-01T00:00:00.000Z' },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      users: globalUsers.map((user: any) => ({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        registeredAt: user.registeredAt
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, user, username, email, password } = await request.json();
    
    if (action === 'register') {
      // Kullanıcı var mı kontrol et
      const existingUser = globalUsers.find((u: any) => u.username === (user?.username || username) || u.email === (user?.email || email));
      if (existingUser) {
        return NextResponse.json({ error: 'Kullanıcı adı veya e-posta zaten kullanımda' }, { status: 400 });
      }
      
      // Yeni kullanıcı ekle
      const newUser = {
        id: Date.now().toString(),
        username: user?.username || username,
        email: user?.email || email,
        password: user?.password || password,
        registeredAt: new Date().toISOString()
      };
      globalUsers.push(newUser);
      
      return NextResponse.json({
        success: true,
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email,
          registeredAt: newUser.registeredAt
        }
      });
    }
    
    if (action === 'login') {
      const foundUser = globalUsers.find((u: any) => 
        (u.email === (user?.email || email) || u.username === (user?.username || username)) && 
        u.password === (user?.password || password)
      );
      if (!foundUser) {
        return NextResponse.json({ error: 'Kullanıcı adı/e-posta veya şifre hatalı' }, { status: 401 });
      }
      
      return NextResponse.json({
        success: true,
        user: { 
          id: foundUser.id, 
          username: foundUser.username, 
          email: foundUser.email,
          registeredAt: foundUser.registeredAt
        }
      });
    }
    
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}