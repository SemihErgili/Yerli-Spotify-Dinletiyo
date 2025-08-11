'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPlaylistById, Playlist } from '@/lib/data';
import { SongCard } from '@/components/song-card';

export default function PlaylistPage() {
  const params = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const data = await getPlaylistById(params.id as string);
        setPlaylist(data || null);
      } catch (error) {
        console.error('Playlist yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadPlaylist();
    }
  }, [params.id]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!playlist) {
    return <div>Playlist bulunamadı.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-6">
        <img 
          src={playlist.imageUrl} 
          alt={playlist.title}
          className="w-48 h-48 rounded-lg object-cover"
        />
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{playlist.title}</h1>
          <p className="text-muted-foreground text-lg">{playlist.description}</p>
          <p className="text-sm text-muted-foreground">{playlist.songs.length} şarkı</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Şarkılar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {playlist.songs.map((song) => (
            <SongCard key={song.id} item={song} />
          ))}
        </div>
      </div>
    </div>
  );
}