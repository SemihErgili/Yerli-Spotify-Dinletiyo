import { NextResponse } from 'next/server';
import { createRoom, joinRoom, getRooms } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { action, hostId, roomName, roomId, userId } = await request.json();
    
    if (action === 'create') {
      const { currentSong } = await request.json();
      const room = await createRoom(hostId, roomName, currentSong);
      return NextResponse.json(room);
    }
    
    if (action === 'join') {
      const room = await joinRoom(roomId, userId);
      return NextResponse.json(room);
    }
    
    if (action === 'leave') {
      // Oda terk etme işlemi - basit mock
      return NextResponse.json({ success: true, message: 'Odadan ayrıldınız' });
    }
    
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rooms = await getRooms();
    return NextResponse.json({ rooms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}