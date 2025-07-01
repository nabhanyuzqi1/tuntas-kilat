import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import { 
  Car, 
  Bike, 
  Leaf, 
  Clock, 
  Star, 
  MapPin, 
  CreditCard,
  BarChart3,
  Users,
  Plus,
  MessageSquare
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["/api/orders"],
  });

  const quickActions = [
    {
      icon: Plus,
      title: "Pesan Layanan",
      description: "Cuci motor, mobil, atau potong rumput",
      href: "/booking",
      color: "bg-primary"
    },
    {
      icon: MapPin,
      title: "Lacak Pesanan",
      description: "Monitor status pesanan real-time",
      href: "/tracking",
      color: "bg-blue-500"
    },
    {
      icon: MessageSquare,
      title: "Chat Support",
      description: "Bantuan 24/7 via WhatsApp",
      href: "#",
      color: "bg-green-500"
    },
    {
      icon: Star,
      title: "Membership",
      description: "Cek status dan benefit",
      href: "#",
      color: "bg-yellow-500"
    }
  ];

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'cuci_motor': return Bike;
      case 'cuci_mobil': return Car;
      case 'potong_rumput': return Leaf;
      default: return Car;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'assigned': return 'bg-purple-500';
      case 'ontheway': return 'bg-orange-500';
      case 'arrived': return 'bg-indigo-500';
      case 'inprogress': return 'bg-primary';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Dikonfirmasi';
      case 'assigned': return 'Ditugaskan';
      case 'ontheway': return 'Dalam Perjalanan';
      case 'arrived': return 'Tiba di Lokasi';
      case 'inprogress': return 'Sedang Dikerjakan';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const membershipColor = user?.membershipLevel === 'gold' ? 'bg-yellow-500' : 
                         user?.membershipLevel === 'silver' ? 'bg-gray-400' : 'bg-bronze-500';

  return (
    <div className="min-h-screen bg-stone">
      <Navbar />
      
      {/* Welcome Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Selamat datang, {user?.firstName || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Siap untuk memesan layanan hari ini?
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge className={`${membershipColor} text-white`}>
                {user?.membershipLevel?.toUpperCase() || 'REGULAR'} Member
              </Badge>
              <span className="text-sm text-gray-500">
                Total pesanan: {user?.orderCount || 0}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Aksi Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Pesanan Terbaru</h2>
            <Link href="/tracking">
              <Button variant="outline" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.slice(0, 3).map((order: any) => {
                const ServiceIcon = getServiceIcon(order.service?.category || 'cuci_mobil');
                return (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <ServiceIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{order.trackingId}</p>
                            <p className="text-sm text-gray-600">
                              {order.service?.name || 'Layanan'} • Rp {order.finalAmount}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {getStatusText(order.status)}
                          </Badge>
                          {order.status === 'ontheway' || order.status === 'inprogress' ? (
                            <Link href={`/tracking/${order.trackingId}`}>
                              <Button variant="outline" size="sm" className="mt-2">
                                Lacak
                              </Button>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum ada pesanan
                </h3>
                <p className="text-gray-600 mb-6">
                  Mulai pesan layanan pertama Anda dan nikmati kemudahan Ambon Gercep
                </p>
                <Link href="/booking">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Pesan Sekarang
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Available Services */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Layanan Tersedia</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {services?.map((service: any) => {
              const ServiceIcon = getServiceIcon(service.category);
              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ServiceIcon className="w-6 h-6 text-primary" />
                      </div>
                      {service.category === 'cuci_mobil' && (
                        <Badge variant="secondary">Populer</Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        Rp {service.basePrice}
                      </div>
                      <Link href="/booking">
                        <Button size="sm">
                          Pesan
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Admin/Worker Quick Access */}
      {(user?.role === 'admin_umum' || user?.role === 'admin_perusahaan' || user?.role === 'worker') && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Khusus</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(user?.role === 'admin_umum' || user?.role === 'admin_perusahaan') && (
                <Link href="/admin/dashboard">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
                          <p className="text-sm text-gray-600">Kelola operasional dan analisis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
              
              {user?.role === 'worker' && (
                <Link href="/worker/dashboard">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Worker Dashboard</h3>
                          <p className="text-sm text-gray-600">Tugas dan jadwal harian</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
