
'use client';

import { getPlaylistById } from "@/lib/data";
import { notFound } from "next/navigation";
import { PlaylistHeader } from "@/components/playlist-header";
import { SongList } from "@/components/song-list";
import { AdCarousel } from '@/components/ad-carousel';

interface PlaylistPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  const playlist = await getPlaylistById(id);

  if (!playlist) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PlaylistHeader playlist={playlist} />

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

      <SongList songs={playlist.songs} />

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
