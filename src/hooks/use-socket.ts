'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:9002');
    setSocket(socketInstance);

    // Kullanıcı giriş bilgilerini gönder
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    if (loggedUser.id) {
      socketInstance.emit('user-login', loggedUser);
    }

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
}