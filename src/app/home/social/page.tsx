'use client';

import { useState, useEffect } from 'react';
import { FriendsSystem } from '@/components/friends-system';
import { FriendRequests } from '@/components/friend-requests';
import { ListeningRooms } from '@/components/listening-rooms';
import { ListeningParty } from '@/components/listening-party';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SocialPage() {
  const [userId, setUserId] = useState('1');
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserId(user.id);
      checkCurrentRoom(user.id);
    }
  }, []);
  
  const checkCurrentRoom = async (userId: string) => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      const userRoom = data.rooms?.find((room: any) => room.members.includes(userId));
      setCurrentRoom(userRoom);
    } catch (error) {
      console.error('Oda kontrol hatası:', error);
    }
  };
  
  const leaveRoom = async () => {
    if (!currentRoom) return;
    
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          roomId: currentRoom.id,
          userId
        })
      });
      
      if (response.ok) {
        setCurrentRoom(null);
        alert('Odadan ayrıldın!');
      }
    } catch (error) {
      alert('Hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-4xl font-bold">Sosyal</h1>
        {currentRoom && (
          <Button onClick={leaveRoom} variant="destructive">
            "{currentRoom.name}" odasından ayrıl
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Arkadaşlar</TabsTrigger>
          <TabsTrigger value="requests">Gelen İstekler</TabsTrigger>
          <TabsTrigger value="rooms">Beraber Dinle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="friends" className="space-y-4">
          <FriendsSystem userId={userId} />
        </TabsContent>
        
        <TabsContent value="requests" className="space-y-4">
          <FriendRequests userId={userId} />
        </TabsContent>
        
        <TabsContent value="rooms" className="space-y-4">
          <ListeningParty />
        </TabsContent>
      </Tabs>
    </div>
  );
}