
"use client";

import Image from "next/image";
import dynamic from 'next/dynamic';

const YouTubePlayer = dynamic(() => import('@/components/youtube-player').then(mod => ({ default: mod.YouTubePlayer })), {
  ssr: false,
  loading: () => null
});
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Mic2, ListMusic, Volume2, Maximize2, Home, Search, Library, Shuffle, Repeat, X, Heart } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Song } from "@/lib/data";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

const mobileNavLinks = [
  { href: "/home", label: "Ana Sayfa", icon: Home },
  { href: "/home/search", label: "Ara", icon: Search },
  { href: "/home/library", label: "Kitaplığın", icon: Library },
];

const placeholderSong: Song = {
  id: '0',
  title: 'Şarkı Seçilmedi',
  artist: 'Dinletiyo',
  album: '',
  duration: '0:00',
  imageUrl: 'https://placehold.co/64x64.png',
  audioUrl: '',
  aiHint: 'album cover'
}

type RepeatMode = 'off' | 'one' | 'all';

export function Player() {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song>(placeholderSong);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isYouTube, setIsYouTube] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayNext = (event: Event) => {
    const customEvent = event as CustomEvent<Song>;
    const song = customEvent.detail;
    
    // Mevcut sırayı al
    const currentQueue = [...queue];
    
    // Şarkıyı sıradaki şarkı olarak ekle
    if (currentIndex < currentQueue.length - 1) {
      // Mevcut şarkıdan sonraki pozisyona ekle
      currentQueue.splice(currentIndex + 1, 0, song);
    } else {
      // Sıranın sonuna ekle
      currentQueue.push(song);
    }
    
    // Sırayı güncelle
    setQueue(currentQueue);
  };
  
  const handleRepeatSong = (event: Event) => {
    const customEvent = event as CustomEvent<Song>;
    const song = customEvent.detail;
    
    // Tekrarlama modunu 'one' olarak ayarla
    setRepeatMode('one');
    
    // Şarkıyı çal
    if (currentSong?.id !== song.id) {
      // Cleanup previous song
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Stop current audio/video
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (playerRef.current) {
        playerRef.current.stopVideo();
      }
      
      // Reset progress
      setProgress(0);
      setDuration(0);
      
      // Set new song
      setCurrentSong(song);
      setIsPlaying(true);
      setIsYouTube(Boolean(song.audioUrl && !song.audioUrl.startsWith('http')));
      
      // Save current song for sharing
      localStorage.setItem('current-song', JSON.stringify(song));
      
      // Add to recently played in localStorage
      const recentlyPlayed = JSON.parse(localStorage.getItem('recently-played') || '[]');
      const filtered = recentlyPlayed.filter((item: any) => item.id !== song.id);
      filtered.unshift(song);
      localStorage.setItem('recently-played', JSON.stringify(filtered.slice(0, 20)));
      
      // Update queue
      setQueue(filtered.slice(0, 10));
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    const handlePlaySong = async (event: Event) => {
      const customEvent = event as CustomEvent<Song & { playlist?: Song[] }>;
      const song = customEvent.detail;
      const playlistSongs = (customEvent.detail as any).playlist;
      
      // Cleanup previous song
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      if (currentSong?.id === song.id) {
        setIsPlaying(prev => !prev);
      } else {
        // Stop current audio/video
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        if (playerRef.current) {
          playerRef.current.stopVideo();
        }
        
        // Reset progress
        setProgress(0);
        setDuration(0);
        
        // Set new song
        setCurrentSong(song);
        setIsPlaying(true);
        setIsYouTube(Boolean(song.audioUrl && !song.audioUrl.startsWith('http')));
        
        // Save current song for sharing
        localStorage.setItem('current-song', JSON.stringify(song));
        
        // Add to recently played in localStorage
        const recentlyPlayed = JSON.parse(localStorage.getItem('recently-played') || '[]');
        const filtered = recentlyPlayed.filter((item: any) => item.id !== song.id);
        filtered.unshift(song);
        localStorage.setItem('recently-played', JSON.stringify(filtered.slice(0, 20)));
        
        // Update queue - playlist varsa onu kullan, yoksa recently played kullan
        if (playlistSongs && Array.isArray(playlistSongs)) {
          setQueue(playlistSongs);
          const songIndex = playlistSongs.findIndex(s => s.id === song.id);
          setCurrentIndex(songIndex >= 0 ? songIndex : 0);
        } else {
          setQueue(filtered.slice(0, 10));
          setCurrentIndex(0);
        }
        
        // Sunucu tarafında son çalınan şarkıları güncelle
        try {
          const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
          if (currentUser) {
            const userData = JSON.parse(currentUser);
            await fetch('/api/user-data/recently-played', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userData.id,
                song: song
              }),
            });
          }
        } catch (error) {
          console.error('Son çalınan şarkı sunucuya kaydedilemedi:', error);
        }
      }
    };

    window.addEventListener('playSong', handlePlaySong);
    window.addEventListener('playNext', handlePlayNext as EventListener);
    window.addEventListener('repeatSong', handleRepeatSong as EventListener);
    
    return () => {
      window.removeEventListener('playSong', handlePlaySong);
      window.removeEventListener('playNext', handlePlayNext as EventListener);
      window.removeEventListener('repeatSong', handleRepeatSong as EventListener);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentSong, queue, currentIndex]);

  useEffect(() => {
    if (isYouTube && playerRef.current) {
      const playerState = playerRef.current.getPlayerState();
      
      if (isPlaying && playerState !== 1) { // Not playing
        playerRef.current.playVideo();
      } else if (!isPlaying && playerState === 1) { // Currently playing
        playerRef.current.pauseVideo();
      }
    } else if (audioRef.current && currentSong.audioUrl) {
      if (isPlaying) {
        audioRef.current.src = currentSong.audioUrl;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, isYouTube]);
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // YouTube Player Events
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    // Auto-play when ready
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.playVideo();
      }
    }, 100);
  };

  const onPlayerStateChange = (event: any) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // YouTube Player States:
    // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
    if (event.data === 1) { // Playing
      setIsPlaying(true);
      setDuration(playerRef.current.getDuration());
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          setProgress(playerRef.current.getCurrentTime());
        }
      }, 1000);
    } else if (event.data === 2) { // Paused
      setIsPlaying(false);
    } else if (event.data === 0) { // Ended
      handleSongEnd();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleLoadedMetadata = () => {
     if (audioRef.current) {
        setDuration(audioRef.current.duration);
     }
  }

  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      // Repeat current song
      setProgress(0);
      if (isYouTube && playerRef.current) {
        setTimeout(() => {
          playerRef.current.seekTo(0, true);
          playerRef.current.playVideo();
        }, 100);
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all') {
      playNext();
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  }

  const handleProgressChange = (value: number[]) => {
    if (isYouTube && playerRef.current) {
      playerRef.current.seekTo(value[0], true);
      setProgress(value[0]);
    } else if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = value[0];
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (isYouTube && playerRef.current) {
      playerRef.current.setVolume(newVolume);
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const closeSong = () => {
    // Stop all playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (playerRef.current) {
      playerRef.current.stopVideo();
    }
    
    // Clear intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Reset state
    setIsPlaying(false);
    setCurrentSong(placeholderSong);
    setIsYouTube(false);
    setProgress(0);
    setDuration(0);
  };

  const [isToggling, setIsToggling] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if current song is favorite
  useEffect(() => {
    if (currentSong.id !== '0') {
      // Önce localStorage'dan kontrol et
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.some((fav: any) => fav.id === currentSong.id));
      
      // Sunucudan favori şarkıları kontrol et
      const checkServerFavorites = async () => {
        try {
          const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
          if (currentUser) {
            const userData = JSON.parse(currentUser);
            const response = await fetch(`/api/user-data/favorites?userId=${userData.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.favorites && Array.isArray(data.favorites)) {
                // Sunucudan gelen favori şarkıları localStorage ile senkronize et
                localStorage.setItem('favorites', JSON.stringify(data.favorites));
                setIsFavorite(data.favorites.some((fav: any) => fav.id === currentSong.id));
              }
            }
          }
        } catch (error) {
          console.error('Favori şarkılar sunucudan alınamadı:', error);
        }
      };
      
      checkServerFavorites();
    }
  }, [currentSong]);

  const toggleFavorite = async () => {
    // Önce localStorage'da güncelle
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter((fav: any) => fav.id !== currentSong.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      favorites.push(currentSong);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
    
    // Custom event gönder
    window.dispatchEvent(new CustomEvent('favoriteChanged'));
    
    // Sunucu tarafında da güncelle
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        if (isFavorite) {
          // Favorilerden kaldır
          await fetch(`/api/user-data/favorites?userId=${userData.id}&songId=${currentSong.id}`, {
            method: 'DELETE',
          });
        } else {
          // Favorilere ekle
          await fetch('/api/user-data/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userData.id,
              song: currentSong
            }),
          });
        }
      }
    } catch (error) {
      console.error('Favori şarkı sunucuda güncellenemedi:', error);
    }
  };

  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      const nextSong = queue[currentIndex + 1];
      setCurrentSong(nextSong);
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
      setIsYouTube(Boolean(nextSong.audioUrl && !nextSong.audioUrl.startsWith('http')));
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevSong = queue[currentIndex - 1];
      setCurrentSong(prevSong);
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
      setIsYouTube(Boolean(prevSong.audioUrl && !prevSong.audioUrl.startsWith('http')));
    }
  };

  const togglePlay = () => {
    if (!currentSong.audioUrl || isToggling) return;
    
    setIsToggling(true);
    
    if (isYouTube && playerRef.current) {
      const playerState = playerRef.current.getPlayerState();
      if (playerState === 1) { // Playing
        playerRef.current.pauseVideo();
      } else { // Paused or other
        playerRef.current.playVideo();
      }
    } else {
      setIsPlaying(!isPlaying);
    }
    
    setTimeout(() => {
      setIsToggling(false);
    }, 500);
  };
  
  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
    localStorage.setItem('shuffle-mode', (!isShuffling).toString());
  };

  const toggleRepeat = () => {
    const newMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    setRepeatMode(newMode);
    localStorage.setItem('repeat-mode', newMode);
  };

  // Load saved settings and sync with server
  useEffect(() => {
    const savedShuffle = localStorage.getItem('shuffle-mode');
    const savedRepeat = localStorage.getItem('repeat-mode');
    if (savedShuffle) setIsShuffling(savedShuffle === 'true');
    if (savedRepeat) setRepeatMode(savedRepeat as RepeatMode);
    
    // Sunucudan son çalınan şarkıları ve favorileri al
    const syncWithServer = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          
          // Son çalınan şarkıları al
          const recentlyPlayedResponse = await fetch(`/api/user-data/recently-played?userId=${userData.id}`);
          if (recentlyPlayedResponse.ok) {
            const recentlyPlayedData = await recentlyPlayedResponse.json();
            if (recentlyPlayedData.recentlyPlayed && Array.isArray(recentlyPlayedData.recentlyPlayed)) {
              // Sunucudan gelen son çalınan şarkıları localStorage ile senkronize et
              localStorage.setItem('recently-played', JSON.stringify(recentlyPlayedData.recentlyPlayed));
              
              // Eğer şu anda çalan şarkı yoksa ve son çalınan şarkılar varsa, queue'yu güncelle
              if (currentSong.id === '0' && recentlyPlayedData.recentlyPlayed.length > 0) {
                setQueue(recentlyPlayedData.recentlyPlayed.slice(0, 10));
              }
            }
          }
          
          // Favori şarkıları al
          const favoritesResponse = await fetch(`/api/user-data/favorites?userId=${userData.id}`);
          if (favoritesResponse.ok) {
            const favoritesData = await favoritesResponse.json();
            if (favoritesData.favorites && Array.isArray(favoritesData.favorites)) {
              // Sunucudan gelen favori şarkıları localStorage ile senkronize et
              localStorage.setItem('favorites', JSON.stringify(favoritesData.favorites));
            }
          }
        }
      } catch (error) {
        console.error('Sunucu ile senkronizasyon hatası:', error);
      }
    };
    
    syncWithServer();
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || currentSong.id === '0') return null;

  return (
    <>
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnd}
      />
      
      {/* YouTube Player - Hidden */}
      {isYouTube && mounted && (
        <YouTubePlayer
          videoId={currentSong.audioUrl}
          isPlaying={isPlaying}
          volume={volume}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      )}
      {/* Desktop Player */}
      <footer className="hidden lg:flex items-center justify-between w-full bg-card/80 backdrop-blur-sm border-t border-border px-6 py-3">
        <div className="flex items-center gap-4 w-1/4">
          <ContextMenu>
            <ContextMenuTrigger>
              <Image src={currentSong.imageUrl} alt={currentSong.title} width={56} height={56} className="rounded-md" data-ai-hint={currentSong.aiHint}/>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('repeatSong', { detail: currentSong }))}>
                <Repeat className="mr-2 h-4 w-4" />
                <span>Şarkıyı Tekrarla</span>
              </ContextMenuItem>
              <ContextMenuItem onClick={async () => {
                window.dispatchEvent(new CustomEvent('playNext', { detail: currentSong }));
                // Also add to queue in backend
                try {
                  const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                  if (currentUser) {
                    const userData = JSON.parse(currentUser);
                    await fetch('/api/user-data/queue', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: userData.id,
                        song: currentSong,
                        playNext: true
                      }),
                    });
                  }
                } catch (error) {
                  console.error('Kuyruğa ekleme hatası:', error);
                }
              }}>
                <SkipForward className="mr-2 h-4 w-4" />
                <span>Sonraki Çal</span>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={async () => {
                // Add to favorites in backend
                try {
                  const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                  if (currentUser) {
                    const userData = JSON.parse(currentUser);
                    await fetch('/api/user-data/favorites', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: userData.id,
                        song: currentSong
                      }),
                    });
                    // Update local state
                    setIsFavorite(true);
                    window.dispatchEvent(new CustomEvent('favoriteChanged'));
                  }
                } catch (error) {
                  console.error('Favorilere ekleme hatası:', error);
                }
              }}>
                <Heart className="mr-2 h-4 w-4" />
                <span>Favorilere Ekle</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <div>
            <p className="font-semibold">{currentSong.title}</p>
            <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 w-1/2 max-w-xl">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={toggleShuffle} className={cn("h-10 w-10 text-muted-foreground hover:text-foreground", isShuffling && "text-primary")}>
              <Shuffle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={playPrevious} className="h-10 w-10 text-muted-foreground hover:text-foreground">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              variant="default" 
              size="icon" 
              onClick={togglePlay} 
              disabled={isToggling}
              className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 disabled:opacity-70"
            >
              {isPlaying ? <Pause className="h-6 w-6 text-primary-foreground" /> : <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} className="h-10 w-10 text-muted-foreground hover:text-foreground">
              <SkipForward className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" onClick={toggleRepeat} className={cn("h-10 w-10 text-muted-foreground hover:text-foreground", repeatMode !== 'off' && "text-primary")}>
              <Repeat className="h-5 w-5" />
              {repeatMode === 'one' && <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] rounded-full h-3 w-3 flex items-center justify-center">1</span>}
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground">{formatTime(progress)}</span>
            <Slider value={[progress]} onValueChange={handleProgressChange} max={duration || 100} step={1} />
            <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-1/4 justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFavorite}
            className={cn("text-muted-foreground hover:text-foreground", isFavorite && "text-red-500 hover:text-red-600")}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><ListMusic className="h-5 w-5" /></Button>
          <div className="flex items-center gap-2 w-[120px]">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} />
          </div>
          <Button variant="ghost" size="icon" onClick={closeSong} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </footer>
      
      {/* Mobile Player & Nav */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border flex flex-col z-50">
        <div className="flex items-center w-full px-4 py-2">
           <ContextMenu>
             <ContextMenuTrigger>
               <Image src={currentSong.imageUrl} alt={currentSong.title} width={40} height={40} className="rounded-md" data-ai-hint={currentSong.aiHint}/>
             </ContextMenuTrigger>
             <ContextMenuContent>
               <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('repeatSong', { detail: currentSong }))}>
                 <Repeat className="mr-2 h-4 w-4" />
                 <span>Şarkıyı Tekrarla</span>
               </ContextMenuItem>
               <ContextMenuItem onClick={async () => {
                 window.dispatchEvent(new CustomEvent('playNext', { detail: currentSong }));
                 // Also add to queue in backend
                 try {
                   const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                   if (currentUser) {
                     const userData = JSON.parse(currentUser);
                     await fetch('/api/user-data/queue', {
                       method: 'POST',
                       headers: {
                         'Content-Type': 'application/json',
                       },
                       body: JSON.stringify({
                         userId: userData.id,
                         song: currentSong,
                         playNext: true
                       }),
                     });
                   }
                 } catch (error) {
                   console.error('Kuyruğa ekleme hatası:', error);
                 }
               }}>
                 <SkipForward className="mr-2 h-4 w-4" />
                 <span>Sonraki Çal</span>
               </ContextMenuItem>
               <ContextMenuSeparator />
               <ContextMenuItem onClick={async () => {
                 // Add to favorites in backend
                 try {
                   const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                   if (currentUser) {
                     const userData = JSON.parse(currentUser);
                     await fetch('/api/user-data/favorites', {
                       method: 'POST',
                       headers: {
                         'Content-Type': 'application/json',
                       },
                       body: JSON.stringify({
                         userId: userData.id,
                         song: currentSong
                       }),
                     });
                     // Update local state
                     setIsFavorite(true);
                     window.dispatchEvent(new CustomEvent('favoriteChanged'));
                   }
                 } catch (error) {
                   console.error('Favorilere ekleme hatası:', error);
                 }
               }}>
                 <Heart className="mr-2 h-4 w-4" />
                 <span>Favorilere Ekle</span>
               </ContextMenuItem>
             </ContextMenuContent>
           </ContextMenu>
           <div className="flex-1 mx-3">
              <p className="font-semibold text-sm truncate">{currentSong.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
           </div>
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={togglePlay}
             disabled={isToggling}
             className="disabled:opacity-70"
           >
             {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
           </Button>
        </div>
        <nav className="w-full grid grid-cols-3 items-center border-t border-border">
          {mobileNavLinks.map((link) => (
             <Link key={link.href} href={link.href} className={cn(
                "flex flex-col items-center justify-center py-2 text-muted-foreground hover:text-primary",
                pathname === link.href && "text-primary bg-primary/10"
             )}>
                <link.icon className="h-6 w-6"/>
                <span className="text-xs mt-1">{link.label}</span>
             </Link>
          ))}
        </nav>
      </footer>
    </>
  );
}
