'use client';

import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function LibraryPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      const recent = JSON.parse(localStorage.getItem('recently-played') || '[]');
      setFavorites(favs);
      setRecentlyPlayed(recent.slice(0, 20));
    };

    loadData();
    
    const handleStorageChange = () => {
      loadData();
    };
    
    const handleFavoriteChange = () => {
      loadData();
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
    </div>
  );
}
