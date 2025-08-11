
'use server';

import fs from 'fs';
import path from 'path';

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  registeredAt: string;
  avatar?: string;
  preferences?: UserPreferences;
  favorites?: Song[];
  recentlyPlayed?: Song[];
}

interface UserPreferences {
  artists: string[];
  genres: string[];
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
  aiHint?: string;
}

// JSON dosyasından kullanıcıları oku
function loadUsers(): User[] {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'users.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Kullanıcı verisi okunamadı:', error);
  }
  return [];
}

// JSON dosyasına kullanıcıları yaz
function saveUsers(users: User[]) {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'users.json');
    const dataDir = path.dirname(dataPath);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Kullanıcı verisi yazılamadı:', error);
  }
}

export async function signup(userData: Omit<User, 'id' | 'registeredAt'> & { password: string }) {
  const users = loadUsers();
  const existingUser = users.find(u => u.email === userData.email || u.username === userData.username);
  if (existingUser) {
    throw new Error('Bu e-posta adresi veya kullanıcı adı zaten kullanılıyor.');
  }

  const newUser: User = {
    id: Date.now().toString(),
    username: userData.username,
    email: userData.email,
    password: userData.password,
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  return { message: 'Kayıt başarılı! Hoş geldiniz.' };
}

export async function login(email: string, password: string) {
  const users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    // Eğer sunucuda kullanıcı yoksa, demo kullanıcısı oluştur
    if (email && password) {
      return {
        id: Date.now().toString(),
        username: email.split('@')[0],
        email: email,
        registeredAt: new Date().toISOString(),
        avatar: undefined
      };
    }
    throw new Error('Böyle bir kullanıcı bulunamadı.');
  }

  if (user.password !== password) {
    throw new Error('Şifre yanlış.');
  }

  return { 
    id: user.id, 
    username: user.username, 
    email: user.email,
    registeredAt: user.registeredAt,
    avatar: user.avatar
  };
}

export async function updateProfile(userId: string, data: { username?: string; avatar?: string }) {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('Kullanıcı bulunamadı.');
  }

  if (data.username) {
    user.username = data.username;
  }

  if (data.avatar !== undefined) {
    user.avatar = data.avatar;
  }

  saveUsers(users);
  return { id: user.id, username: user.username, email: user.email, registeredAt: user.registeredAt, avatar: user.avatar };
}

export async function saveUserPreferences(userId: string, preferences: UserPreferences) {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('Kullanıcı bulunamadı.');
  }

  user.preferences = preferences;
  saveUsers(users);
  return { success: true, message: 'Kullanıcı tercihleri kaydedildi.' };
}

export async function getUserPreferences(userId: string) {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('Kullanıcı bulunamadı.');
  }

  return user.preferences || { artists: [], genres: [] };
}

export async function saveFavoriteSong(userId: string, song: Song) {
  const users = loadUsers();
  let user = users.find(u => u.id === userId);
  
  // Eğer kullanıcı yoksa oluştur
  if (!user) {
    user = {
      id: userId,
      username: 'Demo User',
      email: 'demo@example.com',
      password: 'demo',
      registeredAt: new Date().toISOString(),
      favorites: [],
      recentlyPlayed: []
    };
    users.push(user);
  }

  if (!user.favorites) {
    user.favorites = [];
  }
  
  const existingIndex = user.favorites.findIndex(s => s.id === song.id);
  
  if (existingIndex === -1) {
    user.favorites.push(song);
  }
  
  saveUsers(users);
  return { success: true, message: 'Şarkı favorilere eklendi.' };
}

export async function removeFavoriteSong(userId: string, songId: string) {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('Kullanıcı bulunamadı.');
  }

  if (!user.favorites) {
    return { success: true, message: 'Şarkı favorilerden kaldırıldı.' };
  }
  
  user.favorites = user.favorites.filter(song => song.id !== songId);
  saveUsers(users);
  return { success: true, message: 'Şarkı favorilerden kaldırıldı.' };
}

export async function getFavoriteSongs(userId: string) {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return [];
  }

  return user.favorites || [];
}

export async function addRecentlyPlayedSong(userId: string, song: Song) {
  const users = loadUsers();
  let user = users.find(u => u.id === userId);
  
  // Eğer kullanıcı yoksa oluştur
  if (!user) {
    user = {
      id: userId,
      username: 'Demo User',
      email: 'demo@example.com',
      password: 'demo',
      registeredAt: new Date().toISOString(),
      favorites: [],
      recentlyPlayed: []
    };
    users.push(user);
  }

  if (!user.recentlyPlayed) {
    user.recentlyPlayed = [];
  }
  
  const existingIndex = user.recentlyPlayed.findIndex(s => s.id === song.id);
  
  if (existingIndex !== -1) {
    user.recentlyPlayed.splice(existingIndex, 1);
  }
  
  user.recentlyPlayed.unshift(song);
  
  if (user.recentlyPlayed.length > 20) {
    user.recentlyPlayed = user.recentlyPlayed.slice(0, 20);
  }
  
  saveUsers(users);
  return { success: true, message: 'Son çalınan şarkı eklendi.' };
}

export async function getRecentlyPlayedSongs(userId: string) {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return [];
  }

  return user.recentlyPlayed || [];
}

// Kullanıcıları export et (API endpoint için)
export async function getUsers() {
  return loadUsers();
}




// Avatar support added