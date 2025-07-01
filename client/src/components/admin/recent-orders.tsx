import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Bike, Leaf, MoreHorizontal, Eye, Phone, MessageSquare } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

interface RecentOrdersProps {
  pendingOrders: any[];
}

export default function RecentOrders({ pendingOrders }: RecentOrdersProps) {
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
      case 'arrived': return 'Tiba';
      case 'inprogress': return 'Dikerjakan';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mockOrders = pendingOrders?.length > 0 ? pendingOrders : [
    {
      id: 1,
      trackingId: 'AGC-ABC123',
      service: { name: 'Cuci Motor Basic', category: 'cuci_motor' },
      customerInfo: { name: 'Pak Joko', address: 'Jl. Merdeka 123' },
      finalAmount: '25000',
      status: 'ontheway',
      workerInfo: { name: 'Budi S.' },
      scheduledTime: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      trackingId: 'AGC-DEF456',
      service: { name: 'Cuci Mobil Premium', category: 'cuci_mobil' },
      customerInfo: { name: 'Bu Sari', address: 'Jl. Sudirman 45' },
      finalAmount: '50000',
      status: 'inprogress',
      workerInfo: { name: 'Ahmad R.' },
      scheduledTime: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      trackingId: 'AGC-GHI789',
      service: { name: 'Potong Rumput', category: 'potong_rumput' },
      customerInfo: { name: 'Pak Budi', address: 'Villa Permata' },
      finalAmount: '75000',
      status: 'completed',
      workerInfo: { name: 'Sari W.' },
      scheduledTime: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pesanan Terbaru</CardTitle>
          <Select defaultValue="today">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari ini</SelectItem>
              <SelectItem value="week">Minggu ini</SelectItem>
              <SelectItem value="month">Bulan ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockOrders.map((order) => {
            const ServiceIcon = getServiceIcon(order.service?.category || 'cuci_mobil');
            
            return (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-stone rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ServiceIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{order.trackingId}</p>
                    <p className="text-sm text-gray-600">
                      {order.service?.name || 'Layanan'} • {order.customerInfo?.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(order.createdAt)} • Rp {parseFloat(order.finalAmount || '0').toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                      {getStatusText(order.status)}
                    </Badge>
                    {order.workerInfo?.name && (
                      <p className="text-xs text-gray-500 mt-1">{order.workerInfo.name}</p>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/tracking/${order.trackingId}`}>
                          <a className="flex items-center space-x-2 w-full">
                            <Eye className="w-4 h-4" />
                            <span>Lihat Detail</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="w-4 h-4 mr-2" />
                        Hubungi Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Kirim Pesan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
        
        {mockOrders.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak ada pesanan
            </h3>
            <p className="text-gray-600">
              Belum ada pesanan baru hari ini
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link href="/admin/orders">
            <Button variant="outline">
              Lihat Semua Pesanan
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
