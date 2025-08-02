'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Users, Plus } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  host: string;
  memberCount: number;
  currentSong: any;
  isPlaying: boolean;
}

export function ListeningRooms({ userId }: { userId: string }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Odalar yüklenirken hata:', error);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          hostId: userId,
          roomName
        })
      });
      
      if (response.ok) {
        setRoomName('');
        loadRooms();
        alert('Oda oluşturuldu!');
      }
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          roomId,
          userId
        })
      });
      
      if (response.ok) {
        alert('Odaya katıldın!');
        loadRooms();
      }
    } catch (error) {
      alert('Hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Oda Oluştur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Oda adı..."
              onKeyDown={(e) => e.key === 'Enter' && createRoom()}
            />
            <Button onClick={createRoom} disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Aktif Odalar ({rooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className="text-muted-foreground">Henüz aktif oda yok</p>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {room.memberCount} kişi
                      </span>
                      {room.currentSong && (
                        <span className="flex items-center gap-1">
                          <Music className="h-4 w-4" />
                          {room.isPlaying ? 'Çalıyor' : 'Duraklatıldı'}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => joinRoom(room.id)} size="sm">
                    Katıl
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}