"use client";
<meta name="google-site-verification" content="dREUMPILd7rgKGVZQppOZ5KNbCGm5jDAD02oAnhp4kE" />

import { useEffect, useState } from 'react';
import { SongCard } from "@/components/song-card";
import { SimpleYoutubeSearch } from "@/components/simple-youtube-search";
import { Onboarding } from "@/components/onboarding";
import { getRecentlyPlayed, getMadeForYou, getNewReleases, Playlist, filterPlaylistsByPreferences } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause } from 'lucide-react';
import { AdCarousel } from '@/components/ad-carousel';


interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  position: number;
}

function RecommendedSongs({ userPreferences }: { userPreferences: { artists: string[], genres: string[] } }) {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendedSongs = async () => {
      try {
        const allSongs = [];
        
        // Kullanıcının beğendiği sanatçılardan şarkılar getir
        for (const artist of userPreferences.artists.slice(0, 3)) {
          try {
            const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(artist + ' en iyi şarkıları')}`);
            const data = await response.json();
            
            if (data.videos && data.videos.length > 0) {
              const artistSongs = data.videos.slice(0, 4)
                .filter((video: any) => video.title && video.id && video.thumbnail)
                .map((video: any) => ({
                  id: video.id,
                  title: video.title,
                  artist: artist,
                  album: '',
                  duration: video.duration || '0:00',
                  imageUrl: video.thumbnail,
                  audioUrl: video.id
                }));
              allSongs.push(...artistSongs);
            }
          } catch (error) {
            console.error(`${artist} için şarkılar yüklenemedi:`, error);
          }
        }
        
        setSongs(allSongs);
      } catch (error) {
        console.error('Önerilen şarkılar yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendedSongs();
  }, [userPreferences]);

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Senin İçin Önerilen Şarkılar</h2>
        <div className="text-center py-8">Yükleniyor...</div>
      </section>
    );
  }

  if (songs.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight mb-4">Senin İçin Önerilen Şarkılar</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {songs.map((song) => (
          <div 
            key={song.id}
            onClick={() => {
              const songWithPlaylist = { ...song, playlist: songs };
              window.dispatchEvent(new CustomEvent('playSong', { detail: songWithPlaylist }));
            }}
            className="cursor-pointer group w-full overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/60 transition-colors relative rounded-lg p-3"
          >
            <img src={song.imageUrl} alt={song.title} className="w-full aspect-square object-cover rounded-lg mb-3" />
            <p className="text-base font-semibold truncate">{song.title}</p>
            <p className="text-sm truncate text-muted-foreground">{song.artist}</p>
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {song.duration}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlaylistSection({ title, fetchData, userPreferences }: { 
  title: string; 
  fetchData: () => Promise<Playlist[]>;
  userPreferences?: { artists: string[], genres: string[] } | null;
}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data = await fetchData();
        // Kullanıcı tercihlerine göre filtrele
        const filteredData = userPreferences ? 
          await filterPlaylistsByPreferences(data, userPreferences) : data;
        // Ensure playlists is always an array
        setPlaylists(Array.isArray(filteredData) ? filteredData : []);
      } catch (error) {
        console.error('Playlist yüklenirken hata:', error);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, [fetchData, userPreferences]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (playlists.length === 0) {
    return null; // Tercihlere uygun playlist yoksa gösterme
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






  useEffect(() => {
    // Sağ tıkı tamamen engelle
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('contextmenu', disableRightClick);
    
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
    };
  }, []);

  useEffect(() => {
    const loadUserPreferences = async () => {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        const onboardingKey = `onboarding-completed-${user.id}`;
        const preferencesKey = `user-preferences-${user.id}`;
        
        // Önce localStorage'dan kontrol et
        const hasCompletedOnboarding = localStorage.getItem(onboardingKey);
        
        // Sunucudan kullanıcı tercihlerini al
        try {
          const response = await fetch(`/api/user-data?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.preferences) {
              // Sunucudan gelen tercihleri localStorage ile senkronize et
              localStorage.setItem(preferencesKey, JSON.stringify(data.preferences));
              setUserPreferences(data.preferences);
              
              // Eğer sunucuda tercihler varsa, onboarding tamamlanmış demektir
              if (!hasCompletedOnboarding && (data.preferences.artists.length > 0 || data.preferences.genres.length > 0)) {
                localStorage.setItem(onboardingKey, 'true');
              } else if (!hasCompletedOnboarding) {
                setShowOnboarding(true);
              }
              return;
            }
          }
        } catch (error) {
          console.error('Kullanıcı tercihleri sunucudan alınamadı:', error);
        }
        
        // Sunucudan veri alınamazsa localStorage'dan kontrol et
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
        } else {
          const preferences = localStorage.getItem(preferencesKey);
          if (preferences) {
            setUserPreferences(JSON.parse(preferences));
          }
        }
      }
    };
    
    loadUserPreferences();
  }, []);

  const handleOnboardingComplete = async (preferences: {artists: string[], genres: string[]}) => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      const onboardingKey = `onboarding-completed-${user.id}`;
      const preferencesKey = `user-preferences-${user.id}`;
      
      console.log('Saving preferences for user:', user.id, preferences);
      
      // Önce localStorage'da güncelle
      localStorage.setItem(onboardingKey, 'true');
      localStorage.setItem(preferencesKey, JSON.stringify(preferences));
      setUserPreferences(preferences);
      setShowOnboarding(false);
      
      // Sunucu tarafında da güncelle
      try {
        const response = await fetch('/api/user-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            preferences: preferences
          }),
        });
        const result = await response.json();
        console.log('Server response:', result);
      } catch (error) {
        console.error('Kullanıcı tercihleri sunucuya kaydedilemedi:', error);
      }
    }
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

      {/* Üst Reklam Carousel */}
      <section className="mt-8">
        <AdCarousel
          variant="horizontal"
          autoPlay={true}
          showControls={true}
          showDots={true}
          className="max-w-4xl mx-auto"
        />
      </section>

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight">Dinletiyo'da Ara</h2>
        <SimpleYoutubeSearch />
      </div>

      {/* Kullanıcı tercihlerine göre şarkı önerileri */}
      {userPreferences && userPreferences.artists.length > 0 && (
        <RecommendedSongs userPreferences={userPreferences} />
      )}
      
      <PlaylistSection title="Senin için Derlendi" fetchData={() => getMadeForYou(6)} userPreferences={userPreferences} />
      <PlaylistSection title="Yeni Çıkanlar" fetchData={() => getNewReleases(6)} userPreferences={userPreferences} />
      


      {/* Alt Reklam Carousel */}
      <section className="container py-8">
        <AdCarousel
          variant="horizontal"
          autoPlay={true}
          showControls={true}
          showDots={true}
          className="max-w-6xl mx-auto"
        />
      </section>
      
      <footer className="text-center text-sm text-muted-foreground py-8 border-t">
        Topluyo Inc tarafından 2025 Semih Ergili
      </footer>
    </div>
  );
}
