'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Users, X } from 'lucide-react';

interface CurrentSong {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

export function NowPlayingWidget() {
  const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null);
  const [showWidget, setShowWidget] = useState(false);
  const [listeners, setListeners] = useState(1);

  useEffect(() => {
    // Şarkı değişikliklerini dinle
    const handleSongChange = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      const song = customEvent.detail;
      
      if (song && song.id !== '0') {
        setCurrentSong({
          id: song.id,
          title: song.title,
          artist: song.artist,
          thumbnail: song.imageUrl
        });
        setShowWidget(true);
      } else {
        setShowWidget(false);
      }
    };

    window.addEventListener('playSong', handleSongChange);
    return () => window.removeEventListener('playSong', handleSongChange);
  }, []);

  const createListeningRoom = async () => {
    if (!currentSong) return;
    
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          hostId: loggedUser.id,
          roomName: `${currentSong.title} - ${currentSong.artist}`,
          currentSong: currentSong
        })
      });
      
      if (response.ok) {
        alert('Beraber dinleme odası oluşturuldu!');
        setListeners(1);
      }
    } catch (error) {
      alert('Hata oluştu');
    }
  };

  if (!showWidget || !currentSong) return null;

  return (
    <div className="fixed bottom-20 left-6 z-50">
      <Card className="w-80 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="text-sm font-medium">Şimdi Çalıyor</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWidget(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{currentSong.title}</p>
              <p className="text-xs opacity-90 truncate">{currentSong.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              <Users className="h-3 w-3" />
              <span>{listeners} dinliyor</span>
            </div>
            <Button
              onClick={createListeningRoom}
              size="sm"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Katıl
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}