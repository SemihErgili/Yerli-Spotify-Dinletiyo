'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  avatar?: string;
}

export function FriendsSystem({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = () => {
    const friendsData = JSON.parse(localStorage.getItem('user-friends') || '{}');
    const userFriends = friendsData[userId] || [];
    setFriends(userFriends);
  };

  const sendFriendRequest = async () => {
    if (!username.trim()) return;
    
    setLoading(true);
    
    try {
      // Global kullanıcıları çek
      const response = await fetch('/api/users');
      const data = await response.json();
      const users = data.users || [];
      
      console.log('Tüm kullanıcılar:', users);
      console.log('Aranan kullanıcı:', username);
      
      const targetUser = users.find((u: any) => {
        const usernameMatch = u.username?.toLowerCase() === username.toLowerCase();
        const emailMatch = u.email.split('@')[0].toLowerCase() === username.toLowerCase();
        return usernameMatch || emailMatch;
      });
      
      if (!targetUser) {
        alert(`Kullanıcı bulunamadı. Kayıtlı kullanıcılar: ${users.map((u: any) => u.username || u.email.split('@')[0]).join(', ')}`);
        setLoading(false);
        return;
      }
    
    // Arkadaş ekle
    const friendsData = JSON.parse(localStorage.getItem('user-friends') || '{}');
    if (!friendsData[userId]) friendsData[userId] = [];
    
    // Zaten arkadaş mı kontrol et
    const isAlreadyFriend = friendsData[userId].some((f: any) => f.id === targetUser.id);
    if (isAlreadyFriend) {
      alert('Bu kullanıcı zaten arkadaşın!');
      setLoading(false);
      return;
    }
    
    // Arkadaşı ekle
    friendsData[userId].push({
      id: targetUser.id,
      username: targetUser.username || targetUser.email.split('@')[0],
      avatar: 'https://placehold.co/40x40.png'
    });
    
    localStorage.setItem('user-friends', JSON.stringify(friendsData));
    
      alert(`${targetUser.username || targetUser.email.split('@')[0]} arkadaş olarak eklendi!`);
      setUsername('');
      loadFriends();
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Arkadaş Ekle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adı..."
              onKeyDown={(e) => e.key === 'Enter' && sendFriendRequest()}
            />
            <Button onClick={sendFriendRequest} disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Ekle'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Arkadaşlarım ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p className="text-muted-foreground">Henüz arkadaşın yok</p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                  <img
                    src={friend.avatar || 'https://placehold.co/40x40.png'}
                    alt={friend.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{friend.username}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}