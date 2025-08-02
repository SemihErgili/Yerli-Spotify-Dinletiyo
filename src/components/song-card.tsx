
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Song, Playlist } from "@/lib/data";

interface SongCardProps {
  item: Song | Playlist;
  className?: string;
}

export function SongCard({ item, className }: SongCardProps) {
  const isPlaylist = 'songs' in item;

  const title = item.title;
  const imageUrl = item.imageUrl;
  const description = isPlaylist ? (item as Playlist).description : (item as Song).artist;
  
  const songToPlay = isPlaylist ? (item as Playlist).songs?.[0] : (item as Song);
  const href = isPlaylist ? `/home/playlist/${item.id}` : '#';

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click/navigation event
    e.preventDefault();
    if (songToPlay && songToPlay.audioUrl) {
      window.dispatchEvent(new CustomEvent('playSong', { detail: songToPlay }));
    }
  };
  
  const CardContentWrapper = ({ children }: { children: React.ReactNode }) => {
      if (isPlaylist) {
          return <Link href={href} className="block hover:no-underline">{children}</Link>
      }
      return <div className="cursor-pointer" onClick={handlePlay}>{children}</div>;
  }

  return (
    <CardContentWrapper>
      <Card className={cn("group w-full overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/60 transition-colors relative", className)}>
        <div className="p-0">
          <div className="relative aspect-square">
            <Image src={imageUrl} alt={title} fill className="object-cover" />
            <div className="absolute bottom-2 right-2">
              {songToPlay && (
                <Button 
                  size="icon" 
                  className="rounded-full w-12 h-12 bg-primary shadow-lg opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-200"
                  onClick={handlePlay}
                  aria-label={`Play ${songToPlay.title}`}
                >
                  <Play className="h-6 w-6 ml-1 fill-primary-foreground text-primary-foreground" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <CardContent className="p-3">
          <p className="text-base font-semibold truncate">{title}</p>
          <p className="text-sm truncate text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </CardContentWrapper>
  );
}
