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
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

export function NavbarSimple() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useSimpleAuth();

  const handleLogout = () => {
    logout();
    setLocation('/auth');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin_umum':
        return 'Admin Umum';
      case 'admin_perusahaan':
        return 'Admin Perusahaan';
      case 'worker':
        return 'Pekerja';
      case 'customer':
        return 'Pelanggan';
      default:
        return 'User';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin_umum':
      case 'admin_perusahaan':
        return Shield;
      case 'worker':
        return Briefcase;
      case 'customer':
      default:
        return UserIcon;
    }
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => setLocation('/')}
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Tuntas Kilat
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setLocation('/')}
              className={`text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors ${
                location === '/' ? 'text-blue-600' : ''
              }`}
            >
              Beranda
            </button>
            <button 
              onClick={() => setLocation('/services')}
              className={`text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors ${
                location === '/services' ? 'text-blue-600' : ''
              }`}
            >
              Layanan
            </button>
            <button 
              onClick={() => setLocation('/about')}
              className={`text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors ${
                location === '/about' ? 'text-blue-600' : ''
              }`}
            >
              Tentang
            </button>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
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
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const RoleIcon = getRoleIcon(user.role);
                          return <RoleIcon className="h-3 w-3" />;
                        })()}
                        <span className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/')}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  
                  {/* Role-specific menu items */}
                  {(user.role === 'admin_umum' || user.role === 'admin_perusahaan') && (
                    <DropdownMenuItem onClick={() => setLocation('/admin/dashboard')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  
                  {user.role === 'worker' && (
                    <DropdownMenuItem onClick={() => setLocation('/worker/dashboard')}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Worker Dashboard</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => setLocation('/testing')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Testing</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => setLocation('/auth')}>
                  Masuk
                </Button>
                <Button onClick={() => setLocation('/auth')}>
                  Daftar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}