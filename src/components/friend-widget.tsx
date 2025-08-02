'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, X, Minimize2 } from 'lucide-react';

export function FriendWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const sendFriendRequest = async () => {
    if (!username.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          fromUserId: '1', // Demo user ID
          toUsername: username
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Arkadaşlık isteği gönderildi!');
        setUsername('');
        setIsOpen(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {isOpen ? (
        <Card className="w-80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Arkadaş Ekle</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground mb-2">
              Dene: ahmet, ayse, mehmet
            </div>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adı..."
              onKeyDown={(e) => e.key === 'Enter' && sendFriendRequest()}
              className="text-sm"
            />
            <Button 
              onClick={sendFriendRequest} 
              disabled={loading}
              className="w-full"
              size="sm"
            >
              {loading ? 'Gönderiliyor...' : 'Arkadaş Ekle'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg"
          size="icon"
        >
          <UserPlus className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}