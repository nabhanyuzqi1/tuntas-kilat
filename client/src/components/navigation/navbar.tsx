import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocation } from 'wouter';
import { LogOut, User as UserIcon, Settings, Home, Briefcase, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan';
  profileImageUrl?: string;
}

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUser(userData);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setLocation('/auth');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin_perusahaan':
        return 'Admin Perusahaan';
      case 'admin_umum':
        return 'Admin Umum';
      case 'worker':
        return 'Pekerja';
      case 'customer':
      default:
        return 'Pelanggan';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin_perusahaan':
      case 'admin_umum':
        return <Shield className="w-4 h-4" />;
      case 'worker':
        return <Briefcase className="w-4 h-4" />;
      case 'customer':
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Tuntas Kilat</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Beranda
              </Button>
              <Button 
                onClick={() => setLocation('/auth')}
              >
                Masuk
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Tuntas Kilat</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Role-based navigation */}
            {(user.role === 'admin_perusahaan' || user.role === 'admin_umum') && (
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/admin')}
                className={location === '/admin' ? 'bg-gray-100' : ''}
              >
                <Shield className="w-4 h-4 mr-2" />
                Dashboard Admin
              </Button>
            )}
            
            {user.role === 'worker' && (
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/worker')}
                className={location === '/worker' ? 'bg-gray-100' : ''}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Dashboard Pekerja
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className={location === '/' ? 'bg-gray-100' : ''}
            >
              <Home className="w-4 h-4 mr-2" />
              Beranda
            </Button>

            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                    <AvatarFallback>
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setLocation('/profile')}
                  className="cursor-pointer"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLocation('/settings')}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}