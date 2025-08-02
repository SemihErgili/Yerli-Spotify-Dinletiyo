'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Music, Activity, Database, Trash2, Eye, Lock } from 'lucide-react';

// Gizli admin bilgileri - kimseye söyleme!
const ADMIN_USERNAME = 'semihergili';
const ADMIN_PASSWORD = '21052109';

export default function DevPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [bannedIPs, setBannedIPs] = useState<string[]>([]);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [searchIP, setSearchIP] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [activeAnnouncements, setActiveAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSongs: 0,
    totalRooms: 0
  });

  const loadSecurityLogs = async () => {
    try {
      const response = await fetch('/api/security');
      const data = await response.json();
      setSecurityLogs(data.logs || []);
    } catch (error) {
      console.error('Güvenlik logları yüklenemedi:', error);
    }
  };

  const loadBannedIPs = async () => {
    console.log('Banlı IP listesi yükleniyor...');
    try {
      const response = await fetch('/api/ip-ban');
      console.log('IP ban API response status:', response.status);
      const data = await response.json();
      console.log('IP ban API response data:', data);
      setBannedIPs(data.bannedIPs || []);
      console.log('Banlı IP listesi güncellendi:', data.bannedIPs);
    } catch (error) {
      console.error('Banlı IP listesi yüklenemedi:', error);
    }
  };

  const banIP = async (ip: string) => {
    console.log('IP banlama işlemi başlatıldı:', ip);
    try {
      const response = await fetch('/api/ip-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', ip })
      });
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        alert(data.message);
        loadBannedIPs();
      } else {
        alert('IP banlama başarısız: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('IP banlama hatası:', error);
      alert('IP banlama hatası: ' + error);
    }
  };

  const unbanIP = async (ip: string) => {
    try {
      const response = await fetch('/api/ip-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unban', ip })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadBannedIPs();
      }
    } catch (error) {
      alert('IP ban kaldırma hatası!');
    }
  };

  const searchIPInfo = async () => {
    if (!searchIP.trim()) return;
    
    try {
      const response = await fetch('/api/ip-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: searchIP })
      });
      const data = await response.json();
      if (data.success) {
        setTrackingData(data.data);
      }
    } catch (error) {
      alert('IP bilgisi alınamadı!');
    }
  };

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/system?action=status');
      const data = await response.json();
      if (data.success) {
        setSystemStatus(data.data);
      }
    } catch (error) {
      console.error('Sistem durumu yüklenemedi:', error);
    }
  };

  const handleSystemAction = async (action: string, payload?: any) => {
    try {
      const response = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: payload })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        if (action === 'maintenance') {
          loadSystemStatus();
        }
      }
    } catch (error) {
      alert('Sistem işlemi başarısız!');
    }
  };

  const loadActiveAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements?type=all');
      const data = await response.json();
      if (data.success) {
        setActiveAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error('Duyurular yüklenemedi:', error);
    }
  };

  const sendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      alert('Başlık ve içerik gerekli!');
      return;
    }
    
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setAnnouncementTitle('');
        setAnnouncementContent('');
        loadActiveAnnouncements();
      }
    } catch (error) {
      alert('Duyuru gönderilemedi!');
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadActiveAnnouncements();
      }
    } catch (error) {
      alert('Duyuru silinemedi!');
    }
  };

  const clearAllAnnouncements = async () => {
    if (!confirm('TÜM DUYURULARI SİLMEK İSTİYOR MUSUNUZ?')) return;
    
    try {
      const response = await fetch('/api/announcements', {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadActiveAnnouncements();
      }
    } catch (error) {
      alert('Duyurular silinemedi!');
    }
  };

  useEffect(() => {
    // Güvenlik loglarını ve banlı IP'leri yükle
    loadSecurityLogs();
    loadBannedIPs();
    loadSystemStatus();
    loadActiveAnnouncements();
    
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(() => {
        loadData();
        loadSecurityLogs();
        loadBannedIPs();
        loadSystemStatus();
        loadActiveAnnouncements();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // IP ve konum bilgisi al
  const getClientInfo = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        ip: data.ip,
        city: data.city,
        country: data.country_name,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        ip: 'Bilinmiyor',
        city: 'Bilinmiyor',
        country: 'Bilinmiyor',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
    }
  };

  const handleLogin = async () => {
    const clientInfo = await getClientInfo();
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Başarılı giriş
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
      
      // Başarılı giriş logla
      const successLog = {
        type: 'SUCCESS',
        username,
        ...clientInfo,
        message: 'Başarılı admin girişi'
      };
      
      await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(successLog)
      });
      
      loadSecurityLogs();
      
    } else {
      // Başarısız giriş - güvenlik logu
      const failLog = {
        type: 'FAILED',
        username: username || 'Boş',
        password: password ? '***' : 'Boş',
        ...clientInfo,
        message: 'YETKİSİZ ERİŞİM DENEMESİ!'
      };
      
      await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(failLog)
      });
      
      loadSecurityLogs();
      
      alert('🚨 YETKİSİZ ERİŞİM! Bu deneme kaydedildi.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Dev Panel Girişi</CardTitle>
            <p className="text-muted-foreground">Sadece yetkili geliştiriciler</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Kullanıcı adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Giriş Yap
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              🔒 Bu panel gizlidir. Yetkisiz erişim yasaktır.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadData = async () => {
    try {
      // Kullanıcıları yükle
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);

      // İstatistikleri hesapla
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const rooms = JSON.parse(localStorage.getItem('listening-rooms') || '[]');
      const recentlyPlayed = JSON.parse(localStorage.getItem('recently-played') || '[]');

      setStats({
        totalUsers: data.users?.length || 0,
        activeUsers: localUsers.length,
        totalSongs: recentlyPlayed.length,
        totalRooms: rooms.length
      });
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const clearAllData = () => {
    if (confirm('TÜM VERİLERİ SİLMEK İSTEDİĞİNE EMİN MİSİN?')) {
      localStorage.clear();
      sessionStorage.clear();
      alert('Tüm veriler temizlendi!');
      loadData();
    }
  };

  const exportData = () => {
    const data = {
      users: JSON.parse(localStorage.getItem('users') || '[]'),
      favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
      recentlyPlayed: JSON.parse(localStorage.getItem('recently-played') || '[]'),
      rooms: JSON.parse(localStorage.getItem('listening-rooms') || '[]'),
      friends: JSON.parse(localStorage.getItem('user-friends') || '{}')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dinletiyo-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">🔧 Geliştirici Paneli</h1>
            <p className="text-muted-foreground">Sistem yönetimi ve istatistikler</p>
          </div>
          <Button 
            onClick={() => setIsAuthenticated(false)}
            variant="outline"
          >
            Çıkış Yap
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dinlenen Şarkı</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSongs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Oda</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="activity">Aktivite</TabsTrigger>
            <TabsTrigger value="security">🚨 Güvenlik</TabsTrigger>
            <TabsTrigger value="ipban">🚫 IP Ban</TabsTrigger>
            <TabsTrigger value="tracking">🔍 Takip</TabsTrigger>
            <TabsTrigger value="system">⚙️ Sistem</TabsTrigger>
            <TabsTrigger value="announcements">📢 Duyurular</TabsTrigger>
            <TabsTrigger value="data">Veri Yönetimi</TabsTrigger>
            <TabsTrigger value="logs">Loglar</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tüm Kullanıcılar ({users.length})</CardTitle>
                  <Button 
                    onClick={loadData}
                    variant="outline"
                    size="sm"
                  >
                    🔄 Yenile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Henüz kayıtlı kullanıcı yok</p>
                  ) : (
                    users.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.username}</span>
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          <span className="text-muted-foreground text-sm">{user.email}</span>
                          {user.registeredAt && (
                            <p className="text-xs text-muted-foreground">
                              Kayıt: {new Date(user.registeredAt).toLocaleString('tr-TR')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            ID: {user.id}
                          </Badge>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`${user.username} kullanıcısını banlamak istediğinize emin misiniz?`)) {
                                alert('Kullanıcı banlama özelliği yakında eklenecek!');
                              }
                            }}
                          >
                            🚫 Ban
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Sistem başlatıldı: {new Date().toLocaleString()}</p>
                  <p>• Toplam kullanıcı: {stats.totalUsers}</p>
                  <p>• Aktif oturumlar: {stats.activeUsers}</p>
                  <p>• Son güncelleme: {new Date().toLocaleTimeString()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-600">🚨 Güvenlik Logları</CardTitle>
                  <Button 
                    onClick={loadSecurityLogs}
                    variant="outline"
                    size="sm"
                  >
                    🔄 Yenile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {securityLogs.length === 0 ? (
                    <p className="text-muted-foreground">Henüz güvenlik logu yok.</p>
                  ) : (
                    securityLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded border ${
                          log.type === 'FAILED' 
                            ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' 
                            : 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={log.type === 'FAILED' ? 'destructive' : 'default'}
                          >
                            {log.type === 'FAILED' ? '🚨 BAŞARISIZ' : '✅ BAŞARILI'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Kullanıcı:</strong> {log.username}</p>
                          <p><strong>IP:</strong> {log.ip}</p>
                          <p><strong>Konum:</strong> {log.city}, {log.country}</p>
                          <p><strong>Tarayıcı:</strong> {log.userAgent.substring(0, 60)}...</p>
                          <p className={log.type === 'FAILED' ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {log.message}
                          </p>
                          {log.type === 'FAILED' && (
                            <div className="mt-2">
                              <Button 
                                onClick={() => banIP(log.ip)}
                                variant="destructive"
                                size="sm"
                              >
                                🚫 IP'yi Banla
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button 
                    onClick={loadSecurityLogs}
                    variant="outline"
                    size="sm"
                  >
                    🔄 Yenile
                  </Button>
                  <Button 
                    onClick={async () => {
                      await fetch('/api/security', { method: 'DELETE' });
                      setSecurityLogs([]);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Temizle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ipban" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-600">🚫 Banlı IP Adresleri</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={loadBannedIPs}
                      variant="outline"
                      size="sm"
                    >
                      🔄 Yenile
                    </Button>
                    <Button 
                      onClick={async () => {
                        if (confirm('TÜM IP BANLARINI KALDIRMAK İSTİYOR MUSUN?')) {
                          await fetch('/api/ip-ban', { method: 'DELETE' });
                          setBannedIPs([]);
                          alert('Tüm IP banları kaldırıldı!');
                        }
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      🗑️ Tümünü Kaldır
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bannedIPs.length === 0 ? (
                    <p className="text-muted-foreground">Henüz banlı IP yok.</p>
                  ) : (
                    bannedIPs.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded dark:bg-red-950 dark:border-red-800">
                        <div>
                          <span className="font-mono font-medium text-red-600">{ip}</span>
                          <Badge variant="destructive" className="ml-2">
                            BANLI
                          </Badge>
                        </div>
                        <Button 
                          onClick={() => unbanIP(ip)}
                          variant="outline"
                          size="sm"
                        >
                          ✅ Ban Kaldır
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    🚨 Banlı IP'ler tüm siteye erişim sağlayamaz!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">🔍 Gelişmiş Kullanıcı Takibi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">IP Adresi Ara:</label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="192.168.1.1" 
                          value={searchIP}
                          onChange={(e) => setSearchIP(e.target.value)}
                        />
                        <Button onClick={searchIPInfo}>🔍 Ara</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">E-posta Ara:</label>
                      <Input placeholder="user@example.com" />
                    </div>
                  </div>
                  
                  {trackingData && (
                    <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-400 mb-3">📍 IP Konum Bilgileri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>IP:</strong> {trackingData.location.ip}</p>
                          <p><strong>Şehir:</strong> {trackingData.location.city}</p>
                          <p><strong>Ülke:</strong> {trackingData.location.country}</p>
                          <p><strong>ISP:</strong> {trackingData.location.isp}</p>
                        </div>
                        <div>
                          <p><strong>Koordinat:</strong> {trackingData.location.coordinates}</p>
                          <p><strong>Zaman Dilimi:</strong> {trackingData.location.timezone}</p>
                          <p><strong>Posta Kodu:</strong> {trackingData.location.zipCode}</p>
                          <p><strong>Bölge:</strong> {trackingData.location.region}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {trackingData && (
                    <div className="bg-red-950/30 border border-red-600 rounded-lg p-4">
                      <h3 className="font-semibold text-red-400 mb-3">🚨 Risk Analizi</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>VPN/Proxy:</strong> <span className={trackingData.risk.vpnProxy ? 'text-red-500' : 'text-green-500'}>
                          {trackingData.risk.vpnProxy ? 'Tespit Edildi' : 'Tespit Edilmedi'}
                        </span></p>
                        <p><strong>Tor Kullanımı:</strong> <span className={trackingData.risk.tor ? 'text-red-500' : 'text-green-500'}>
                          {trackingData.risk.tor ? 'Tespit Edildi' : 'Tespit Edilmedi'}
                        </span></p>
                        <p><strong>Bot Aktivitesi:</strong> <span className="text-yellow-500">{trackingData.risk.botActivity}</span></p>
                        <p><strong>Giriş Denemesi:</strong> <span className="text-red-500">{trackingData.risk.failedAttempts} Başarısız</span></p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-400 mb-3">📱 Cihaz Bilgileri</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Tarayıcı:</strong> Chrome 120.0.0.0</p>
                      <p><strong>OS:</strong> Windows 11</p>
                      <p><strong>Ekran:</strong> 1920x1080</p>
                      <p><strong>Dil:</strong> tr-TR</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">⚙️ Sistem Kontrolleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/maintenance', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'toggle' })
                          });
                          const data = await response.json();
                          if (data.success) {
                            alert(data.message);
                            loadSystemStatus();
                          }
                        } catch (error) {
                          alert('Bakım modu değiştirilemedi!');
                        }
                      }}
                    >
                      🔧 Bakım Modu {systemStatus?.maintenanceMode ? 'Kapat' : 'Aç'}
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleSystemAction('cache-clear')}
                    >
                      🔄 Cache Temizle
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleSystemAction('backup')}
                    >
                      💾 Veritabanı Yedekle
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={() => handleSystemAction('emergency-stop')}
                    >
                      ⚠️ Acil Durdur
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">📊 Sunucu Durumu</CardTitle>
                </CardHeader>
                <CardContent>
                  {systemStatus && (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>CPU Kullanımı:</span>
                        <span className={systemStatus.serverStats.cpu > 80 ? 'text-red-500' : systemStatus.serverStats.cpu > 60 ? 'text-yellow-500' : 'text-green-500'}>
                          {systemStatus.serverStats.cpu}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>RAM Kullanımı:</span>
                        <span className={systemStatus.serverStats.ram > 80 ? 'text-red-500' : systemStatus.serverStats.ram > 60 ? 'text-yellow-500' : 'text-green-500'}>
                          {systemStatus.serverStats.ram}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disk Kullanımı:</span>
                        <span className={systemStatus.serverStats.disk > 80 ? 'text-red-500' : systemStatus.serverStats.disk > 60 ? 'text-yellow-500' : 'text-green-500'}>
                          {systemStatus.serverStats.disk}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ağ Trafiği:</span>
                        <span className="text-blue-500">{systemStatus.serverStats.network} GB/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aktif Bağlantı:</span>
                        <span className="text-green-500">{systemStatus.serverStats.connections.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Çalışma Süresi:</span>
                        <span className="text-blue-500">{systemStatus.serverStats.uptime}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">📢 Yeni Duyuru</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Duyuru başlığı..." 
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                    />
                    <textarea 
                      className="w-full p-3 border rounded-lg bg-background" 
                      rows={3} 
                      placeholder="Duyuru içeriği..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                    ></textarea>
                    <Button className="w-full" onClick={sendAnnouncement}>
                      📢 Duyuru Gönder
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-600">📊 Aktif Duyurular</CardTitle>
                    <Button 
                      onClick={clearAllAnnouncements}
                      variant="destructive"
                      size="sm"
                    >
                      🗑️ Tümünü Sil
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activeAnnouncements.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Aktif duyuru yok</p>
                    ) : (
                      activeAnnouncements.map((announcement) => (
                        <div key={announcement.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{announcement.title}</h4>
                            <Button 
                              onClick={() => deleteAnnouncement(announcement.id)}
                              variant="destructive"
                              size="sm"
                            >
                              🗑️
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{announcement.content}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(announcement.timestamp).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Veri İşlemleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={exportData}
                    className="w-full"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Verileri Dışa Aktar
                  </Button>
                  
                  <Button 
                    onClick={clearAllData}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Tüm Verileri Temizle
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sistem Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground text-sm">
                  <p>• Platform: {navigator.platform}</p>
                  <p>• User Agent: {navigator.userAgent.substring(0, 50)}...</p>
                  <p>• Dil: {navigator.language}</p>
                  <p>• Çevrimiçi: {navigator.onLine ? 'Evet' : 'Hayır'}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sistem Logları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary p-4 rounded border font-mono text-sm max-h-96 overflow-y-auto">
                  <p>[{new Date().toISOString()}] DEV PANEL AÇILDI</p>
                  <p>[{new Date().toISOString()}] Kullanıcı sayısı: {stats.totalUsers}</p>
                  <p>[{new Date().toISOString()}] Sistem durumu: NORMAL</p>
                  <p>[{new Date().toISOString()}] Bellek kullanımı: DÜŞÜK</p>
                  <p>[{new Date().toISOString()}] API durumu: AKTİF</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-muted-foreground text-sm">
          <p>🔒 Bu panel sadece yetkili geliştiriciler içindir 🔒</p>
        </div>
      </div>
    </div>
  );
}