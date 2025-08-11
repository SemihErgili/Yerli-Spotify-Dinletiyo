'use client';

import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { AdCarousel } from '@/components/ad-carousel';

export default function LibraryPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadLocalData = () => {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        const favs = JSON.parse(localStorage.getItem(`favorites-${userData.id}`) || '[]');
        const recent = JSON.parse(localStorage.getItem(`recently-played-${userData.id}`) || '[]');
        setFavorites(favs);
        setRecentlyPlayed(recent.slice(0, 20));
      }
    };
    
    const loadServerData = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          
          // Favori şarkıları sunucudan al
          const favoritesResponse = await fetch(`/api/user-data/favorites?userId=${userData.id}`);
          if (favoritesResponse.ok) {
            const favoritesData = await favoritesResponse.json();
            if (favoritesData.favorites && Array.isArray(favoritesData.favorites)) {
              setFavorites(favoritesData.favorites);
              // Sunucudan gelen favori şarkıları localStorage ile senkronize et
              localStorage.setItem(`favorites-${userData.id}`, JSON.stringify(favoritesData.favorites));
            }
          }
          
          // Son çalınan şarkıları sunucudan al
          const recentlyPlayedResponse = await fetch(`/api/user-data/recently-played?userId=${userData.id}`);
          if (recentlyPlayedResponse.ok) {
            const recentlyPlayedData = await recentlyPlayedResponse.json();
            if (recentlyPlayedData.recentlyPlayed && Array.isArray(recentlyPlayedData.recentlyPlayed)) {
              setRecentlyPlayed(recentlyPlayedData.recentlyPlayed.slice(0, 20));
              // Sunucudan gelen son çalınan şarkıları localStorage ile senkronize et
              localStorage.setItem(`recently-played-${userData.id}`, JSON.stringify(recentlyPlayedData.recentlyPlayed));
            }
          }
        }
      } catch (error) {
        console.error('Sunucudan veri alınamadı:', error);
        // Sunucudan veri alınamazsa localStorage'dan yükle
        loadLocalData();
      }
    };

    // Önce localStorage'dan yükle (hızlı erişim için)
    loadLocalData();
    // Sonra sunucudan güncel verileri al
    loadServerData();
    
    const handleStorageChange = () => {
      loadLocalData();
    };
    
    const handleFavoriteChange = () => {
      loadLocalData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoriteChanged', handleFavoriteChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoriteChanged', handleFavoriteChange);
    };
  }, []);

  const togglePlay = (song: any) => {
    window.dispatchEvent(new CustomEvent('playSong', { detail: song }));
    
    if (currentSong === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song.id);
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-headline text-4xl font-bold mb-2">Favoriler</h1>
        <p className="text-muted-foreground text-lg">Beğendiğin ve dinlediğin şarkılar.</p>
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

      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Beğenilen Şarkılar</h2>
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz beğenilen şarkı yok. Şarkılara kalp atarak buraya ekleyebilirsin!
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((song, index) => (
              <div 
                key={song.id}
                className="flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                <div className="flex-shrink-0 w-12 h-12 relative ml-2">
                  <img 
                    src={song.imageUrl} 
                    alt={song.title} 
                    className="w-full h-full object-cover rounded"
                  />
                  <button 
                    onClick={() => togglePlay(song)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {currentSong === song.id && isPlaying ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 text-white" />
                    )}
                  </button>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
                {currentSong === song.id && isPlaying && (
                  <div className="ml-4 flex items-center">
                    <span className="text-sm text-primary">Çalıyor</span>
                    <div className="ml-2 flex space-x-1">
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Son Dinlenenler</h2>
        {recentlyPlayed.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz dinlenen şarkı yok.
          </div>
        ) : (
          <div className="space-y-2">
            {recentlyPlayed.map((song, index) => (
              <div 
                key={`${song.id}-${index}`}
                className="flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                <div className="flex-shrink-0 w-12 h-12 relative ml-2">
                  <img 
                    src={song.imageUrl} 
                    alt={song.title} 
                    className="w-full h-full object-cover rounded"
                  />
                  <button 
                    onClick={() => togglePlay(song)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {currentSong === song.id && isPlaying ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 text-white" />
                    )}
                  </button>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
                {currentSong === song.id && isPlaying && (
                  <div className="ml-4 flex items-center">
                    <span className="text-sm text-primary">Çalıyor</span>
                    <div className="ml-2 flex space-x-1">
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

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
    </div>
  );
}
