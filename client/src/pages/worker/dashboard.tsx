import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWebSocket } from "@/lib/websocket";
import { 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  XCircle,
  Navigation,
  Phone,
  MessageSquare,
  DollarSign,
  Car,
  Bike,
  Leaf
} from "lucide-react";

export default function WorkerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('available');

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

  // Fetch worker profile and assigned orders
  const { data: worker } = useQuery({
    queryKey: ["/api/workers/profile"],
    retry: false,
  });

  const { data: assignedOrders } = useQuery({
    queryKey: ["/api/workers/orders"],
    retry: false,
  });

  // WebSocket for real-time order updates
  useWebSocket((message) => {
    if (message.type === 'new_order_assignment' && message.data.workerId === worker?.id) {
      queryClient.invalidateQueries({ queryKey: ["/api/workers/orders"] });
      toast({
        title: "Pesanan Baru!",
        description: `Anda mendapat pesanan baru: ${message.data.trackingId}`,
      });
    }
  });

  // Update worker status
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest('/api/workers/status', 'PATCH', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers/profile"] });
      toast({
        title: "Status Updated",
        description: "Status Anda berhasil diperbarui",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Accept/Reject order
  const orderActionMutation = useMutation({
    mutationFn: async ({ orderId, action }: { orderId: number; action: 'accept' | 'reject' }) => {
      return await apiRequest(`/api/orders/${orderId}/${action}`, 'PATCH');
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers/orders"] });
      toast({
        title: action === 'accept' ? "Pesanan Diterima" : "Pesanan Ditolak",
        description: action === 'accept' ? "Anda berhasil menerima pesanan" : "Pesanan telah ditolak",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to process order action",
        variant: "destructive",
      });
    },
  });

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
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'accepted': return 'bg-green-500';
      case 'ontheway': return 'bg-orange-500';
      case 'arrived': return 'bg-purple-500';
      case 'inprogress': return 'bg-primary';
      case 'completed': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  if (!isAuthenticated || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-stone">
      <Navbar />
      
      {/* Header Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Worker
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola pesanan dan jadwal kerja Anda
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge className={`${getStatusColor(worker?.availability || 'offline')} text-white`}>
                {worker?.availability?.toUpperCase() || 'OFFLINE'}
              </Badge>
              <Select value={selectedStatus} onValueChange={(value) => {
                setSelectedStatus(value);
                statusMutation.mutate(value);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                    <p className="text-2xl font-bold text-gray-900">{worker?.totalOrders || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{worker?.averageRating || 0}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</p>
                    <p className="text-2xl font-bold text-gray-900">
                      Rp {(worker?.monthlyEarnings || 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pesanan Hari Ini</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {assignedOrders?.filter((order: any) => 
                        new Date(order.createdAt).toDateString() === new Date().toDateString()
                      ).length || 0}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <Card>
            <CardHeader>
              <CardTitle>Pesanan Saya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedOrders?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Belum ada pesanan</p>
                ) : (
                  assignedOrders?.map((order: any) => {
                    const ServiceIcon = getServiceIcon(order.service?.category || 'cuci_motor');
                    const customerInfo = typeof order.customerInfo === 'string' 
                      ? JSON.parse(order.customerInfo) 
                      : order.customerInfo || {};
                    
                    return (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <ServiceIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{order.service?.name}</h4>
                              <p className="text-sm text-gray-600">#{order.trackingId}</p>
                            </div>
                          </div>
                          <Badge className={`${getOrderStatusColor(order.status)} text-white`}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Customer</p>
                            <p className="font-medium">{customerInfo.name || 'Unknown Customer'}</p>
                            <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Alamat</p>
                            <p className="text-sm">{customerInfo.address}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-primary">
                              Rp {(order.finalAmount || 0).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-600">
                              {order.estimatedDuration} menit
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {order.status === 'assigned' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => orderActionMutation.mutate({ orderId: order.id, action: 'reject' })}
                                  disabled={orderActionMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Tolak
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => orderActionMutation.mutate({ orderId: order.id, action: 'accept' })}
                                  disabled={orderActionMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Terima
                                </Button>
                              </>
                            )}
                            
                            {(order.status === 'accepted' || order.status === 'ontheway') && (
                              <Button size="sm" variant="outline">
                                <Navigation className="w-4 h-4 mr-1" />
                                Navigasi
                              </Button>
                            )}
                            
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                            
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}