import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import TaskList from "@/components/worker/task-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  MapPin, 
  Phone, 
  Clock, 
  DollarSign,
  Star,
  Navigation,
  CheckCircle
} from "lucide-react";

export default function WorkerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not worker
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'worker')) {
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

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
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

  const todayOrders = orders?.filter((order: any) => {
    const orderDate = new Date(order.scheduledTime);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }) || [];

  const activeOrder = todayOrders.find((order: any) => 
    ['assigned', 'ontheway', 'arrived', 'inprogress'].includes(order.status)
  );

  const completedToday = todayOrders.filter((order: any) => order.status === 'completed').length;
  const todayEarnings = todayOrders
    .filter((order: any) => order.status === 'completed')
    .reduce((sum: number, order: any) => sum + parseFloat(order.finalAmount || '0'), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'ontheway': return 'bg-orange-500';
      case 'arrived': return 'bg-purple-500';
      case 'inprogress': return 'bg-primary';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Ditugaskan';
      case 'ontheway': return 'Dalam Perjalanan';
      case 'arrived': return 'Tiba di Lokasi';
      case 'inprogress': return 'Sedang Dikerjakan';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-stone">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-primary text-white p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Hai, {user.firstName || 'Teknisi'}!</h1>
              <p className="text-teal-100">Status: Aktif</p>
            </div>
            <div className="text-right">
              <p className="text-teal-100 text-sm">Hari ini</p>
              <p className="text-2xl font-bold">Rp {todayEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{todayOrders.length}</p>
              <p className="text-sm text-gray-600">Tugas Hari Ini</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedToday}</p>
              <p className="text-sm text-gray-600">Selesai</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">Rp {todayEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Pendapatan</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-gray-600">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Task */}
        {activeOrder && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span>Tugas Aktif</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{activeOrder.trackingId}</p>
                    <p className="text-gray-600">{activeOrder.service?.name || 'Layanan'}</p>
                  </div>
                  <Badge className={`${getStatusColor(activeOrder.status)} text-white`}>
                    {getStatusText(activeOrder.status)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {activeOrder.customerInfo?.address || 'Alamat tidak tersedia'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {activeOrder.customerInfo?.phone || 'Nomor tidak tersedia'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(activeOrder.scheduledTime).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIB
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1 bg-green-500 hover:bg-green-600">
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigasi
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Hubungi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Tasks */}
        <TaskList orders={todayOrders} isLoading={ordersLoading} />
      </div>
    </div>
  );
}
