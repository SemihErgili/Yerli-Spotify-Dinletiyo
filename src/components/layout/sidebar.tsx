
"use client";

import Link from "next/link";
import { Home, Search, Library, Plus, User, LogOut, Settings, Users, ListMusic } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimpleYoutubeSearch } from "@/components/simple-youtube-search";
import { getPlaylists, Playlist } from "@/lib/data";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/home", label: "Ana Sayfa", icon: Home },
  { href: "/home/library", label: "Kitaplığın", icon: Library },
  { href: "/home/playlists", label: "Playlistler", icon: ListMusic },
];

interface LoggedInUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const updateUser = () => {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        setUser({
          id: userData.id,
          username: userData.username || userData.email.split('@')[0],
          email: userData.email,
          avatar: userData.avatar
        });
      } else {
        setUser(null);
      }
    };

    updateUser();
    window.addEventListener('storage', updateUser);
    
    return () => {
      window.removeEventListener('storage', updateUser);
    };
  }, []);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data = await getPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error('Playlist yüklenirken hata:', error);
      }
    };
    loadPlaylists();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-[280px] bg-card border-r border-border p-4 space-y-6">
      <div className="px-2">
        <Link href="/home" aria-label="Ana Sayfa">
          <Logo />
        </Link>
      </div>

      <nav>
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Button
                variant={pathname === link.href ? "secondary" : "ghost"}
                asChild
                className="w-full justify-start text-base font-semibold"
              >
                <Link href={link.href}>
                  <link.icon className="mr-3 h-5 w-5" />
                  {link.label}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1 flex flex-col min-h-0 bg-secondary/30 rounded-lg p-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-base font-semibold tracking-tight">Çalma Listelerin</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 pr-2">
            {playlists.map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start truncate font-normal"
                asChild
              >
                <Link href={`/home/playlist/${playlist.id}`}>
                  {playlist.title}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-14 p-2" disabled={!user}>
              <Avatar className="mr-3">
                <AvatarImage src={user?.avatar} alt={user?.username} data-ai-hint="user avatar"/>
                <AvatarFallback>{user ? user.username.substring(0, 2).toUpperCase() : '??'}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold">{user ? user.username : 'Kullanıcı'}</p>
                <p className="text-sm text-muted-foreground">Premium</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side="top">
            <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/home/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                 <Link href="/home/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Ayarlar</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
