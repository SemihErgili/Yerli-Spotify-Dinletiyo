
import { getPlaylistById } from "@/lib/data";
import { notFound } from "next/navigation";
import { PlaylistHeader } from "@/components/playlist-header";
import { SongList } from "@/components/song-list";

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
      <SongList songs={playlist.songs} />
    </div>
  );
}
