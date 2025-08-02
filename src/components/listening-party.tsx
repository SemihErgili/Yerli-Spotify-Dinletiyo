'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Play, Pause, Volume2, Share } from 'lucide-react';
import { useState as useReactState, useEffect as useReactEffect } from 'react';

interface ListeningRoom {
  id: string;
  name: string;
  host: string;
  currentSong: any;
  isPlaying: boolean;
  listeners: string[];
  createdAt: number;
}

export function ListeningParty() {
  const [rooms, setRooms] = useState<ListeningRoom[]>([]);
  const [roomName, setRoomName] = useState('');
  const [currentRoom, setCurrentRoom] = useState<ListeningRoom | null>(null);
  const [user, setUser] = useState<any>(null);

  useReactEffect(() => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000); // 5 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  const loadRooms = () => {
    const savedRooms = JSON.parse(localStorage.getItem('listening-rooms') || '[]');
    // 1 saatten eski odaları temizle
    const activeRooms = savedRooms.filter((room: ListeningRoom) => 
      Date.now() - room.createdAt < 3600000
    );
    setRooms(activeRooms);
    localStorage.setItem('listening-rooms', JSON.stringify(activeRooms));
  };

  const createRoom = () => {
    if (!roomName.trim() || !user) return;

    const newRoom: ListeningRoom = {
      id: Date.now().toString(),
      name: roomName,
      host: user.email,
      currentSong: null,
      isPlaying: false,
      listeners: [user.email],
      createdAt: Date.now()
    };

    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    localStorage.setItem('listening-rooms', JSON.stringify(updatedRooms));
    setCurrentRoom(newRoom);
    setRoomName('');
  };

  const joinRoom = (room: ListeningRoom) => {
    if (!user) return;

    const updatedRoom = {
      ...room,
      listeners: [...room.listeners.filter(l => l !== user.email), user.email]
    };

    const updatedRooms = rooms.map(r => r.id === room.id ? updatedRoom : r);
    setRooms(updatedRooms);
    localStorage.setItem('listening-rooms', JSON.stringify(updatedRooms));
    setCurrentRoom(updatedRoom);

    // Odadaki şarkıyı çal
    if (updatedRoom.currentSong && updatedRoom.isPlaying) {
      window.dispatchEvent(new CustomEvent('playSong', { detail: updatedRoom.currentSong }));
    }
  };

  const leaveRoom = () => {
    if (!currentRoom || !user) return;

    const updatedRoom = {
      ...currentRoom,
      listeners: currentRoom.listeners.filter(l => l !== user.email)
    };

    const updatedRooms = rooms.map(r => r.id === currentRoom.id ? updatedRoom : r);
    setRooms(updatedRooms);
    localStorage.setItem('listening-rooms', JSON.stringify(updatedRooms));
    setCurrentRoom(null);
  };

  const shareCurrentSong = () => {
    if (!currentRoom || !user) return;

    // Şu anda çalan şarkıyı al
    const currentSong = JSON.parse(localStorage.getItem('current-song') || 'null');
    if (!currentSong) return;

    const updatedRoom = {
      ...currentRoom,
      currentSong,
      isPlaying: true
    };

    const updatedRooms = rooms.map(r => r.id === currentRoom.id ? updatedRoom : r);
    setRooms(updatedRooms);
    localStorage.setItem('listening-rooms', JSON.stringify(updatedRooms));
    setCurrentRoom(updatedRoom);
  };

  if (currentRoom) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {currentRoom.name}
            <span className="text-sm text-muted-foreground">
              ({currentRoom.listeners.length} dinleyici)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Host: {currentRoom.host}
          </div>
          
          {currentRoom.currentSong && (
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <img 
                src={currentRoom.currentSong.imageUrl} 
                alt={currentRoom.currentSong.title}
                className="w-12 h-12 rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{currentRoom.currentSong.title}</p>
                <p className="text-sm text-muted-foreground">{currentRoom.currentSong.artist}</p>
              </div>
              {currentRoom.isPlaying ? (
                <Play className="h-5 w-5 text-green-500" />
              ) : (
                <Pause className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Dinleyiciler:</p>
            {currentRoom.listeners.map((listener, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {listener} {listener === currentRoom.host && '(Host)'}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {user?.email === currentRoom.host && (
              <Button onClick={shareCurrentSong} size="sm">
                <Share className="h-4 w-4 mr-2" />
                Şarkı Paylaş
              </Button>
            )}
            <Button onClick={leaveRoom} variant="outline" size="sm">
              Odadan Çık
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Beraber Dinleme Odası Oluştur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Oda adı..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createRoom()}
            />
            <Button onClick={createRoom}>Oluştur</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktif Odalar</CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Henüz aktif oda yok. İlk odayı sen oluştur!
            </p>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Host: {room.host} • {room.listeners.length} dinleyici
                    </p>
                  </div>
                  <Button onClick={() => joinRoom(room)} size="sm">
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