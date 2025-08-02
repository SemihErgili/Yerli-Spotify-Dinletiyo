"use client";

import { useEffect, useState } from 'react';
import { SongCard } from "@/components/song-card";
import { SimpleYoutubeSearch } from "@/components/simple-youtube-search";
import { Onboarding } from "@/components/onboarding";
import { getRecentlyPlayed, getMadeForYou, getNewReleases, Playlist } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  position: number;
}

function PlaylistSection({ title, fetchData }: { title: string; fetchData: () => Promise<Playlist[]> }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data = await fetchData();
        setPlaylists(data);
      } catch (error) {
        console.error('Playlist yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, [fetchData]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {playlists.map((playlist) => (
          <SongCard 
            key={playlist.id} 
            item={playlist}
          />
        ))}
      </div>
    </section>
  );
}



export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{artists: string[], genres: string[]} | null>(null);
  const [showFriendBox, setShowFriendBox] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState(0);

  // Her 3 saniyede istekleri kontrol et
  useEffect(() => {
    const checkRequests = async () => {
      const loggedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      if (loggedUser.id) {
        try {
          const response = await fetch(`/api/friends?userId=${loggedUser.id}&type=requests`);
          const data = await response.json();
          setFriendRequests(data.requests?.length || 0);
        } catch (error) {
          console.error('İstek kontrol hatası:', error);
        }
      }
    };

    checkRequests();
    const interval = setInterval(checkRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendFriendRequest = async () => {
    if (!username.trim()) return;
    
    // Giriş yapan kullanıcının ID'sini al
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const currentUserId = loggedUser.id || '1';
    
    setLoading(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          fromUserId: currentUserId,
          toUsername: username
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Arkadaşlık isteği gönderildi!');
        setUsername('');
        setShowFriendBox(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    } else {
      const preferences = localStorage.getItem('user-preferences');
      if (preferences) {
        setUserPreferences(JSON.parse(preferences));
      }
    }
  }, []);

  const handleOnboardingComplete = (preferences: {artists: string[], genres: string[]}) => {
    localStorage.setItem('onboarding-completed', 'true');
    localStorage.setItem('user-preferences', JSON.stringify(preferences));
    setUserPreferences(preferences);
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="space-y-12 relative">
      <div className="space-y-4">
        <h1 className="font-headline text-4xl font-bold">Merhaba!</h1>
        <p className="text-muted-foreground text-lg">
          {userPreferences ? 
            `${userPreferences.artists.slice(0, 3).join(', ')} ve daha fazlası için önerilerimiz var.` :
            'Sana özel önerilerimiz var.'
          }
        </p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight">Dinletiyo'da Ara</h2>
        <SimpleYoutubeSearch />
      </div>

      <PlaylistSection title="Playlist'ler" fetchData={() => getRecentlyPlayed(6)} />
      <PlaylistSection title="Senin için Derlendi" fetchData={() => getMadeForYou(6)} />
      <PlaylistSection title="Yeni Çıkanlar" fetchData={() => getNewReleases(6)} />
      
      {/* Arkadaş İstekleri Bildirimi */}
      {friendRequests > 0 && (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000
          }}
          onClick={() => window.location.href = '/home/social'}
        >
          +{friendRequests}
        </div>
      )}
      

      
      <footer className="text-center text-sm text-muted-foreground py-8 border-t">
        Topluyo Inc tarafından 2025 Semih Ergili
      </footer>
      

    </div>
  );
}
