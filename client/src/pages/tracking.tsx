import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import OrderMap from "@/components/tracking/order-map";
import OrderStatus from "@/components/tracking/order-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/lib/websocket";
import { 
  Search, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  MessageSquare,
  Star,
  Car,
  Bike,
  Leaf
} from "lucide-react";

export default function Tracking() {
  const params = useParams();
  const [trackingInput, setTrackingInput] = useState(params?.trackingId || '');
  const [currentTrackingId, setCurrentTrackingId] = useState(params?.trackingId || '');

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: [`/api/orders/tracking/${currentTrackingId}`],
    enabled: !!currentTrackingId,
  });

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (message.type === 'order_update' && message.data.trackingId === currentTrackingId) {
      refetch();
    }
  });

  const handleSearch = () => {
    if (trackingInput.trim()) {
      setCurrentTrackingId(trackingInput.trim());
    }
  };

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
      case 'pending': return 'Menunggu Konfirmasi';
      case 'confirmed': return 'Dikonfirmasi';
      case 'assigned': return 'Teknisi Ditugaskan';
      case 'ontheway': return 'Teknisi Dalam Perjalanan';
      case 'arrived': return 'Teknisi Tiba di Lokasi';
      case 'inprogress': return 'Sedang Dikerjakan';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-stone">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Lacak Pesanan</h1>
          
          {/* Search Bar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <Input
                  placeholder="Masukkan ID Pesanan (contoh: AGC-ABC123)"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Lacak
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Not Found */}
        {currentTrackingId && !isLoading && !order && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pesanan Tidak Ditemukan
              </h3>
              <p className="text-gray-600">
                Periksa kembali ID pesanan Anda atau hubungi customer service
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 animate-pulse"></div>
              <p className="text-gray-600">Mencari pesanan...</p>
            </CardContent>
          </Card>
        )}

        {/* Order Found */}
        {order && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map & Location */}
            <div className="space-y-6">
              <OrderMap order={order} />
              
              {/* Order Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Detail Pesanan</CardTitle>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {(() => {
                        const ServiceIcon = getServiceIcon(order.service?.category || 'cuci_mobil');
                        return <ServiceIcon className="w-5 h-5 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-semibold">{order.trackingId}</p>
                      <p className="text-sm text-gray-600">{order.service?.name || 'Layanan'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{order.customerInfo?.address || 'Alamat tidak tersedia'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(order.scheduledTime).toLocaleDateString('id-ID')} - {' '}
                        {new Date(order.scheduledTime).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} WIB
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{order.customerInfo?.name || 'Nama tidak tersedia'}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-semibold">Total Pembayaran</span>
                    <span className="font-bold text-primary">Rp {parseFloat(order.finalAmount).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status & Worker Info */}
            <div className="space-y-6">
              <OrderStatus order={order} />
              
              {/* Worker Info */}
              {order.workerInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Teknisi Anda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{order.workerInfo.name}</h4>
                        <div className="flex items-center mt-1">
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (order.workerInfo?.rating || 0)
                                    ? 'fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {order.workerInfo.rating || 0} (127 ulasan)
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">5 tahun pengalaman</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="flex items-center justify-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Hubungi
                      </Button>
                      <Button variant="outline" className="flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              {['assigned', 'ontheway', 'arrived', 'inprogress'].includes(order.status) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Aksi Cepat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat dengan Customer Service
                    </Button>
                    {order.status === 'assigned' && (
                      <Button variant="destructive" className="w-full">
                        Batalkan Pesanan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>Metode Pembayaran</span>
                    <Badge variant="outline">{order.paymentMethod?.toUpperCase() || 'CASH'}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span>Status</span>
                    <Badge 
                      className={
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-white'
                      }
                    >
                      {order.paymentStatus === 'paid' ? 'Dibayar' : 'Menunggu Pembayaran'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* No Tracking ID */}
        {!currentTrackingId && (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lacak Pesanan Anda
              </h3>
              <p className="text-gray-600 mb-6">
                Masukkan ID pesanan untuk melihat status real-time dan lokasi teknisi
              </p>
              <p className="text-sm text-gray-500">
                ID pesanan dikirim via WhatsApp atau email setelah konfirmasi
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
