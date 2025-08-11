import { verifyEmailToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Doğrulama kodu bulunamadı.' }, { status: 400 });
  }

  try {
    await verifyEmailToken(token);
    // Kullanıcıyı başarılı bir doğrulama sayfasına veya giriş sayfasına yönlendir
    const redirectUrl = new URL('/login?verified=true', request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    // Hata durumunda kullanıcıyı bir hata sayfasına yönlendir
    const errorUrl = new URL('/login?error=verification_failed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}
