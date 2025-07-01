import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import StatsGrid from "@/components/admin/stats-grid";
import RecentOrders from "@/components/admin/recent-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus, 
  Send, 
  Download,
  Users,
  Clock,
  CheckCircle
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'admin_umum' && user?.role !== 'admin_perusahaan'))) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
    retry: false,
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ["/api/orders/pending"],
    retry: false,
  });

  const { data: workers } = useQuery({
    queryKey: ["/api/workers"],
    retry: false,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Plus,
      title: "Tambah Teknisi",
      description: "Daftarkan teknisi baru",
      color: "bg-primary",
      onClick: () => toast({ title: "Feature coming soon!" })
    },
    {
      icon: Send,
      title: "Kirim Broadcast",
      description: "Broadcast ke pelanggan",
      color: "bg-orange-500",
      onClick: () => toast({ title: "Feature coming soon!" })
    },
    {
      icon: Download,
      title: "Export Laporan",
      description: "Unduh laporan lengkap",
      color: "bg-blue-500",
      onClick: () => toast({ title: "Feature coming soon!" })
    }
  ];

  const performanceData = [
    { name: "Cuci Motor", value: 65, color: "bg-primary" },
    { name: "Cuci Mobil", value: 25, color: "bg-orange-500" },
    { name: "Potong Rumput", value: 10, color: "bg-green-500" }
  ];

  return (
    <div className="min-h-screen bg-stone">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-2">
            Kelola operasional, pantau performa, dan analisis bisnis
          </p>
        </div>

        {/* Stats Grid */}
        <StatsGrid analytics={analytics} isLoading={analyticsLoading} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Orders - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentOrders pendingOrders={pendingOrders} />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={action.onClick}
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-lg mr-3 flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-sm text-gray-600">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performa Minggu Ini</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceData.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Workers */}
            <Card>
              <CardHeader>
                <CardTitle>Teknisi Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                {workers && workers.length > 0 ? (
                  <div className="space-y-3">
                    {workers.filter((worker: any) => worker.availability === 'available').slice(0, 5).map((worker: any) => (
                      <div key={worker.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Teknisi #{worker.employeeId}</p>
                            <p className="text-xs text-gray-500">
                              {worker.specializations ? JSON.parse(worker.specializations).join(', ') : 'All services'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                          Online
                        </Badge>
                      </div>
                    ))}
                    {workers.filter((worker: any) => worker.availability === 'available').length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Tidak ada teknisi yang tersedia saat ini
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Memuat data teknisi...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
