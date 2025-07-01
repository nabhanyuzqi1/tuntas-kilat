import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Car, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  BarChart3,
  Users,
  MapPin,
  MessageSquare
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Beranda', href: '/', current: location === '/' },
    { name: 'Layanan', href: '/#services', current: false },
    { name: 'Lacak Pesanan', href: '/tracking', current: location.startsWith('/tracking') },
    { name: 'Tentang', href: '/#about', current: false },
  ];

  const userNavigation = [
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin_umum' || user?.role === 'admin_perusahaan') {
    userNavigation.unshift({
      name: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: BarChart3
    });
  }

  if (user?.role === 'worker') {
    userNavigation.unshift({
      name: 'Worker Dashboard',
      href: '/worker/dashboard',
      icon: Users
    });
  }

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      default: return 'bg-bronze-500';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ambon Gercep</h1>
                <p className="text-xs text-gray-500">Service On Demand</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a className={`transition-colors ${
                  item.current 
                    ? 'text-primary font-semibold' 
                    : 'text-gray-700 hover:text-primary'
                }`}>
                  {item.name}
                </a>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName || 'User'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`${getMembershipColor(user.membershipLevel)} text-white text-xs`}
                            variant="secondary"
                          >
                            {user.membershipLevel?.toUpperCase() || 'REGULAR'}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">{user.firstName || 'User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href}>
                          <a className="flex items-center space-x-2 w-full">
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="flex items-center space-x-2 w-full">
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Quick Action Buttons */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/booking">
                    <Button size="sm">
                      Pesan Layanan
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => window.location.href = "/api/login"}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Masuk
              </Button>
            )}

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-3 pb-6 border-b">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="font-bold text-gray-900">Ambon Gercep</h1>
                      <p className="text-xs text-gray-500">Service On Demand</p>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="py-6 space-y-4">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <a 
                          className={`block px-3 py-2 text-base transition-colors ${
                            item.current 
                              ? 'text-primary font-semibold bg-primary/5 rounded-lg' 
                              : 'text-gray-700'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </a>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile User Section */}
                  {isAuthenticated && user && (
                    <>
                      <div className="border-t pt-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.firstName || 'User'}</p>
                            <Badge className={`${getMembershipColor(user.membershipLevel)} text-white text-xs`}>
                              {user.membershipLevel?.toUpperCase() || 'REGULAR'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {userNavigation.map((item) => (
                            <Link key={item.name} href={item.href}>
                              <a 
                                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <item.icon className="w-4 h-4" />
                                <span>{item.name}</span>
                              </a>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-auto">
                        <Link href="/booking">
                          <Button className="w-full mb-3" onClick={() => setMobileMenuOpen(false)}>
                            Pesan Layanan
                          </Button>
                        </Link>
                        <a 
                          href="/api/logout"
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar</span>
                        </a>
                      </div>
                    </>
                  )}

                  {!isAuthenticated && (
                    <div className="border-t pt-6 mt-auto">
                      <Button 
                        className="w-full"
                        onClick={() => {
                          window.location.href = "/api/login";
                          setMobileMenuOpen(false);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Masuk
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
