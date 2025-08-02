'use client';

import { useEffect, useState } from 'react';

export function RoomSync({ userId }: { userId: string }) {
  const [currentRoom, setCurrentRoom] = useState<any>(null);

  useEffect(() => {
    const checkRoomSync = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        const userRoom = data.rooms?.find((room: any) => room.members.includes(userId));
        
        if (userRoom && userRoom.currentSong) {
          // Eğer odada şarkı varsa ve değişmişse, player'a gönder
          if (!currentRoom || currentRoom.currentSong?.id !== userRoom.currentSong.id) {
            const songData = {
              id: userRoom.currentSong.id,
              title: userRoom.currentSong.title,
              artist: 'YouTube',
              album: 'Beraber Dinleme',
              duration: '0:00',
              imageUrl: `https://img.youtube.com/vi/${userRoom.currentSong.id}/mqdefault.jpg`,
              audioUrl: `youtube:${userRoom.currentSong.id}`,
              aiHint: 'youtube thumbnail'
            };
            
            window.dispatchEvent(new CustomEvent('playSong', { detail: songData }));
          }
        }
        
        setCurrentRoom(userRoom);
      } catch (error) {
        console.error('Oda senkronizasyon hatası:', error);
      }
    };

    // Her 2 saniyede kontrol et
    const interval = setInterval(checkRoomSync, 2000);
    checkRoomSync(); // İlk kontrol

    return () => clearInterval(interval);
  }, [userId, currentRoom]);

  return null; // Görünmez component
}