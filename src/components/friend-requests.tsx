'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, Users } from 'lucide-react';

interface FriendRequest {
  id: string;
  username: string;
  avatar?: string;
}

export function FriendRequests({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch(`/api/friends?userId=${userId}&type=requests`);
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('İstekler yüklenirken hata:', error);
    }
  };

  const acceptRequest = async (fromUserId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          userId,
          fromUserId
        })
      });
      
      if (response.ok) {
        alert('Arkadaşlık isteği kabul edildi!');
        loadRequests();
      }
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (fromUserId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          userId,
          fromUserId
        })
      });
      
      if (response.ok) {
        alert('Arkadaşlık isteği reddedildi');
        loadRequests();
      }
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gelen Arkadaşlık İstekleri ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-muted-foreground">Henüz arkadaşlık isteğin yok</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={request.avatar || 'https://placehold.co/40x40.png'}
                    alt={request.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{request.username}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => acceptRequest(request.id)}
                    disabled={loading}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Kabul Et
                  </Button>
                  <Button
                    onClick={() => rejectRequest(request.id)}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Reddet
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}