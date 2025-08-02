
'use server';

import { Resend } from 'resend';
import crypto from 'crypto';
import VerifyEmail from '@/components/emails/verify-email';

// !!! UYARI: Bu, GÖSTERİM AMAÇLI sahte bir kimlik doğrulama servisidir. !!!
// Gerçek bir uygulamada, Firebase Authentication, Auth.js (NextAuth), vb. kullanın.

// Doğrudan API anahtarını kullanıyoruz (test amaçlı)
const resend = new Resend('re_Akamv5kD_CMywTwktHwfR1FyWocUS8ojm');
// Use production URL as the primary domain
const domain = 'https://dinletiyo-main-paf3.vercel.app';

interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  emailVerified: boolean;
  verificationToken: string | null;
  friends: string[];
  friendRequests: string[];
}

interface ListeningRoom {
  id: string;
  name: string;
  host: string;
  members: string[];
  currentSong: {
    id: string;
    title: string;
    url: string;
    position: number;
  } | null;
  isPlaying: boolean;
  createdAt: Date;
}

// -- START: Sahte Veritabanı Düzeltmesi --
declare global {
  var __users_db__: User[];
  var __rooms_db__: ListeningRoom[];
}

if (!global.__users_db__) {
  global.__users_db__ = [
    {
      id: '1',
      username: 'demo',
      email: 'demo@dinletiyo.com',
      passwordHash: 'hashed:password123',
      avatar: 'https://placehold.co/100x100.png',
      emailVerified: true,
      verificationToken: null,
      friends: [],
      friendRequests: ['2', '3'],
    },
    {
      id: '2',
      username: 'ahmet',
      email: 'ahmet@test.com',
      passwordHash: 'hashed:123456',
      avatar: 'https://placehold.co/100x100.png',
      emailVerified: true,
      verificationToken: null,
      friends: [],
      friendRequests: [],
    },
    {
      id: '3',
      username: 'ayse',
      email: 'ayse@test.com',
      passwordHash: 'hashed:123456',
      avatar: 'https://placehold.co/100x100.png',
      emailVerified: true,
      verificationToken: null,
      friends: [],
      friendRequests: [],
    },
    {
      id: '4',
      username: 'mehmet',
      email: 'mehmet@test.com',
      passwordHash: 'hashed:123456',
      avatar: 'https://placehold.co/100x100.png',
      emailVerified: true,
      verificationToken: null,
      friends: [],
      friendRequests: [],
    },
  ];
}

if (!global.__rooms_db__) {
  global.__rooms_db__ = [];
}

const users = global.__users_db__;
const rooms = global.__rooms_db__;
// -- END: Sahte Veritabanı Düzeltmesi --

export async function signup(userData: Omit<User, 'id' | 'passwordHash' | 'emailVerified' | 'verificationToken'> & { password: string }) {
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error('Bu e-posta adresi zaten kullanılıyor.');
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const newUser: User = {
    id: String(users.length + 1),
    username: userData.username,
    email: userData.email,
    passwordHash: `hashed:${userData.password}`,
    avatar: 'https://placehold.co/100x100.png',
    emailVerified: true,
    verificationToken: null,
    friends: [],
    friendRequests: [],
  };

  users.push(newUser);

  const verificationLink = `${domain}/api/verify-email?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: 'Dinletiyo <onboarding@resend.dev>',
      to: newUser.email,
      subject: 'Dinletiyo Hesabınızı Doğrulayın',
      react: VerifyEmail({ verificationLink }),
    });
    console.log('Doğrulama e-postası gönderildi:', newUser.email);
  } catch (error) {
    console.error('E-posta gönderim hatası:', error);
    // Hata durumunda kullanıcıyı silmek veya başka bir işlem yapmak isteyebilirsiniz.
    throw new Error('Doğrulama e-postası gönderilemedi.');
  }

  return { message: 'Kayıt başarılı! Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.' };
}

export async function login(email: string, password_raw: string) {
  const user = users.find(u => u.email === email);

  if (!user) {
    throw new Error('Böyle bir kullanıcı bulunamadı.');
  }

  const isPasswordCorrect = `hashed:${password_raw}` === user.passwordHash;

  if (!isPasswordCorrect) {
    throw new Error('Şifre yanlış.');
  }

  // Mail doğrulama kaldırıldı

  console.log('Giriş başarılı:', user.email);
  return { id: user.id, username: user.username, email: user.email, avatar: user.avatar };
}

export async function verifyEmailToken(token: string) {
  const user = users.find(u => u.verificationToken === token);

  if (!user) {
    throw new Error('Geçersiz veya süresi dolmuş doğrulama kodu.');
  }

  user.emailVerified = true;
  user.verificationToken = null; // Token'ı kullandıktan sonra temizle

  console.log('E-posta doğrulandı:', user.email);
  return { message: 'E-posta adresiniz başarıyla doğrulandı!' };
}

export async function updateProfile(userId: string, data: { username?: string; avatar?: string }) {
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        throw new Error('Güncellenecek kullanıcı bulunamadı.');
    }

    const user = users[userIndex];

    if (data.username) {
        user.username = data.username;
    }
    if (data.avatar !== undefined) {
        user.avatar = data.avatar;
    }
    
    users[userIndex] = user;

    return { id: user.id, username: user.username, email: user.email, avatar: user.avatar };
}

// Arkadaş sistemi
export async function sendFriendRequest(fromUserId: string, toUsername: string) {
    const toUser = users.find(u => u.username === toUsername);
    if (!toUser) throw new Error('Kullanıcı bulunamadı');
    
    // İstek kontrolünü kaldır, her zaman gönderebilsin
    if (!toUser.friendRequests.includes(fromUserId)) {
        toUser.friendRequests.push(fromUserId);
    }
    
    return { 
        message: 'Arkadaşlık isteği gönderildi',
        toUserId: toUser.id 
    };
}

export async function acceptFriendRequest(userId: string, fromUserId: string) {
    const user = users.find(u => u.id === userId);
    const fromUser = users.find(u => u.id === fromUserId);
    
    if (!user || !fromUser) throw new Error('Kullanıcı bulunamadı');
    
    user.friendRequests = user.friendRequests.filter(id => id !== fromUserId);
    user.friends.push(fromUserId);
    fromUser.friends.push(userId);
    
    return { message: 'Arkadaşlık isteği kabul edildi' };
}

export async function getFriends(userId: string) {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Kullanıcı bulunamadı');
    
    const friends = user.friends.map(friendId => {
        const friend = users.find(u => u.id === friendId);
        return friend ? { id: friend.id, username: friend.username, avatar: friend.avatar } : null;
    }).filter(Boolean);
    
    return friends;
}

export async function getFriendRequests(userId: string) {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Kullanıcı bulunamadı');
    
    const requests = user.friendRequests.map((requesterId: string) => {
        const requester = users.find(u => u.id === requesterId);
        return requester ? {
            id: requester.id,
            username: requester.username,
            avatar: requester.avatar
        } : null;
    }).filter(Boolean);
    
    return requests;
}

// Beraber dinleme odaları
export async function createRoom(hostId: string, roomName: string, currentSong?: any) {
    const room: ListeningRoom = {
        id: String(rooms.length + 1),
        name: roomName,
        host: hostId,
        members: [hostId],
        currentSong: currentSong ? {
            id: currentSong.id,
            title: currentSong.title,
            url: `https://www.youtube.com/watch?v=${currentSong.id}`,
            position: 0
        } : null,
        isPlaying: true,
        createdAt: new Date()
    };
    
    rooms.push(room);
    return room;
}

export async function joinRoom(roomId: string, userId: string) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Oda bulunamadı');
    
    if (!room.members.includes(userId)) {
        room.members.push(userId);
    }
    
    return room;
}

export async function leaveRoom(roomId: string, userId: string) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Oda bulunamadı');
    
    room.members = room.members.filter(id => id !== userId);
    
    // Eğer oda boş kaldıysa sil
    if (room.members.length === 0) {
        const index = rooms.findIndex(r => r.id === roomId);
        if (index > -1) rooms.splice(index, 1);
    }
    
    return room;
}

export async function getRooms() {
    return rooms.map(room => ({
        ...room,
        memberCount: room.members.length
    }));
}
