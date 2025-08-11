'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get('user');
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('currentUser', JSON.stringify(userData));
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Ana sayfaya yönlendir
        router.push('/home');
      } catch (error) {
        console.error('User data parse error:', error);
        router.push('/login?error=parse_error');
      }
    } else {
      router.push('/login?error=no_user_data');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Giriş yapılıyor...</h1>
        <p className="text-muted-foreground">Lütfen bekleyin, ana sayfaya yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
}