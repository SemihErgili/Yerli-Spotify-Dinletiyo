'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-white text-lg">Yükleniyor...</p>
    </div>
  );
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    
    if (currentUser) {
      setIsAuth(true);
    } else {
      router.replace('/unauthorized');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuth) {
    return <>{children}</>;
  }

  return null;
}
