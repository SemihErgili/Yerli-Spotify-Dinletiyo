import { NextResponse } from 'next/server';

// Basit in-memory arkadaş sistemi (demo için)
const mockUsers = [
  { id: '1', username: 'demo1', email: 'demo1@test.com' },
  { id: '2', username: 'demo2', email: 'demo2@test.com' },
  { id: '3', username: 'test', email: 'test@test.com' }
];

export async function POST(request: Request) {
  try {
    const { action, fromUserId, toUsername } = await request.json();
    
    if (action === 'send') {
      // Mock kullanıcı kontrolü
      const targetUser = mockUsers.find(u => 
        u.username.toLowerCase() === toUsername.toLowerCase() || 
        u.email.split('@')[0].toLowerCase() === toUsername.toLowerCase()
      );
      
      if (!targetUser) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `${targetUser.username} kullanıcısına arkadaşlık isteği gönderildi!` 
      });
    }
    
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID gerekli' }, { status: 400 });
    }
    
    // Mock arkadaş listesi
    const friends = [
      { id: '2', username: 'demo2', avatar: 'https://placehold.co/40x40.png' },
      { id: '3', username: 'test', avatar: 'https://placehold.co/40x40.png' }
    ];
    
    return NextResponse.json({ friends });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}