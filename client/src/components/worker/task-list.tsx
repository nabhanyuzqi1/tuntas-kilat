import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Bike, Leaf, MapPin, Phone, Clock, Navigation } from "lucide-react";
import { Link } from "wouter";

interface TaskListProps {
  orders: any[];
  isLoading: boolean;
}

export default function TaskList({ orders, isLoading }: TaskListProps) {
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
      case 'arrived': return 'Tiba';
      case 'inprogress': return 'Dikerjakan';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tugas Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data if no orders
  const tasksToShow = orders.length > 0 ? orders : [
    {
      id: 1,
      trackingId: 'AGC-ABC123',
      service: { name: 'Cuci Motor Basic', category: 'cuci_motor' },
      customerInfo: { 
        name: 'Pak Joko', 
        address: 'Jl. Merdeka No 123',
        phone: '0812-xxxx-1234'
      },
      status: 'assigned',
      scheduledTime: new Date().toISOString(),
      finalAmount: '25000'
    },
    {
      id: 2,
      trackingId: 'AGC-DEF456',
      service: { name: 'Cuci Mobil Premium', category: 'cuci_mobil' },
      customerInfo: { 
        name: 'Bu Sari', 
        address: 'Jl. Sudirman No 45',
        phone: '0813-xxxx-5678'
      },
      status: 'assigned',
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      finalAmount: '50000'
    }
  ];

  const activeTasks = tasksToShow.filter(order => 
    ['assigned', 'ontheway', 'arrived', 'inprogress'].includes(order.status)
  );
  
  const upcomingTasks = tasksToShow.filter(order => 
    order.status === 'assigned' && new Date(order.scheduledTime) > new Date()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tugas Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        {tasksToShow.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak ada tugas
            </h3>
            <p className="text-gray-600">
              Belum ada tugas yang ditugaskan untuk hari ini
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasksToShow.map((order) => {
              const ServiceIcon = getServiceIcon(order.service?.category || 'cuci_mobil');
              const isActive = ['ontheway', 'arrived', 'inprogress'].includes(order.status);
              
              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 bg-stone hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ServiceIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order.trackingId}</p>
                        <p className="text-sm text-gray-600">{order.service?.name}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{order.customerInfo?.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{order.customerInfo?.name} ({order.customerInfo?.phone})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{formatTime(order.scheduledTime)} WIB</span>
                    </div>
                  </div>

                  {isActive ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="bg-green-500 hover:bg-green-600 text-white">
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigasi
                      </Button>
                      <Button variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Hubungi
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Rp {parseFloat(order.finalAmount || '0').toLocaleString()}
                      </span>
                      <Link href={`/tracking/${order.trackingId}`}>
                        <Button variant="outline" size="sm">
                          Lihat Detail
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
