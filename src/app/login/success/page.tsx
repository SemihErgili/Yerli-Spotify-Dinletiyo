'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get('user');
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        
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

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginSuccessContent />
    </Suspense>
  );
}