import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// JSON dosyasından kullanıcıları oku
function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// JSON dosyasına kullanıcıları yaz
function writeUsers(users: any[]) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

export async function GET() {
  try {
    const users = readUsers();
    return NextResponse.json({
      success: true,
      users: users.map((user: any) => ({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        registeredAt: user.registeredAt
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, user, username, email, password } = await request.json();
    const users = readUsers();
    
    if (action === 'register') {
      // Kullanıcı var mı kontrol et
      const existingUser = users.find((u: any) => u.username === (user?.username || username) || u.email === (user?.email || email));
      if (existingUser) {
        return NextResponse.json({ error: 'Kullanıcı adı veya e-posta zaten kullanımda' }, { status: 400 });
      }
      
      // Yeni kullanıcı ekle
      const newUser = {
        id: Date.now().toString(),
        username: user?.username || username,
        email: user?.email || email,
        password: user?.password || password,
        registeredAt: new Date().toISOString()
      };
      users.push(newUser);
      writeUsers(users);
      
      return NextResponse.json({
        success: true,
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email,
          registeredAt: newUser.registeredAt
        }
      });
    }
    
    if (action === 'login') {
      const foundUser = users.find((u: any) => 
        (u.email === (user?.email || email) || u.username === (user?.username || username)) && 
        u.password === (user?.password || password)
      );
      if (!foundUser) {
        return NextResponse.json({ error: 'Kullanıcı adı/e-posta veya şifre hatalı' }, { status: 401 });
      }
      
      return NextResponse.json({
        success: true,
        user: { 
          id: foundUser.id, 
          username: foundUser.username, 
          email: foundUser.email,
          registeredAt: foundUser.registeredAt
        }
      });
    }
    
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}