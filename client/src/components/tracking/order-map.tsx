import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock } from "lucide-react";

interface OrderMapProps {
  order: any;
}

export default function OrderMap({ order }: OrderMapProps) {
  const [eta, setEta] = useState(15); // Mock ETA in minutes

  // Simulate ETA countdown
  useEffect(() => {
    if (order.status === 'ontheway' && eta > 0) {
      const interval = setInterval(() => {
        setEta(prev => Math.max(0, prev - 1));
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [order.status, eta]);

  const getLocationStatus = () => {
    switch (order.status) {
      case 'assigned':
        return { text: 'Teknisi sedang bersiap', color: 'bg-blue-500' };
      case 'ontheway':
        return { text: `ETA: ${eta} menit`, color: 'bg-orange-500' };
      case 'arrived':
        return { text: 'Teknisi telah tiba', color: 'bg-green-500' };
      case 'inprogress':
        return { text: 'Sedang dikerjakan', color: 'bg-primary' };
      case 'completed':
        return { text: 'Selesai', color: 'bg-green-600' };
      default:
        return { text: 'Menunggu teknisi', color: 'bg-gray-500' };
    }
  };

  const locationStatus = getLocationStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Lokasi Real-time</span>
          </CardTitle>
          <Badge className={`${locationStatus.color} text-white`}>
            {locationStatus.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mock Map Container */}
        <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-xl h-64 relative overflow-hidden">
          {/* Map Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-8 h-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-gray-300"></div>
              ))}
            </div>
          </div>

          {/* Customer Location (Fixed) */}
          <div className="absolute top-4 left-4 flex flex-col items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <div className="bg-white px-2 py-1 rounded text-xs font-medium mt-1 shadow">
              Rumah Anda
            </div>
          </div>

          {/* Worker Location (Animated) */}
          {['assigned', 'ontheway', 'arrived', 'inprogress'].includes(order.status) && (
            <div 
              className={`absolute transition-all duration-2000 ease-in-out ${
                order.status === 'assigned' ? 'bottom-4 right-4' :
                order.status === 'ontheway' ? 'bottom-16 right-16' :
                order.status === 'arrived' || order.status === 'inprogress' ? 'top-6 left-6' :
                'bottom-4 right-4'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                  order.status === 'ontheway' ? 'animate-pulse' : ''
                }`}>
                  <Navigation className="w-3 h-3 text-white" />
                </div>
                <div className="bg-primary text-white px-2 py-1 rounded text-xs font-medium mt-1 shadow">
                  Teknisi
                </div>
              </div>
            </div>
          )}

          {/* Route Line (if worker is on the way) */}
          {order.status === 'ontheway' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <pattern id="dash" patternUnits="userSpaceOnUse" width="8" height="8">
                  <rect width="4" height="8" fill="#14b8a6" />
                  <rect x="4" width="4" height="8" fill="transparent" />
                </pattern>
              </defs>
              <path
                d="M 80 240 Q 150 120 240 80"
                stroke="url(#dash)"
                strokeWidth="3"
                fill="none"
                className="animate-pulse"
              />
            </svg>
          )}

          {/* Center Info */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center shadow-lg">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Interactive Map</p>
              <p className="text-xs text-gray-500">Google Maps Integration</p>
              
              {order.status === 'ontheway' && (
                <div className="mt-2 flex items-center justify-center space-x-1 text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">ETA: {eta} menit</span>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-white/90 rounded p-2 text-xs">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Lokasi Anda</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Teknisi</span>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="mt-4 space-y-2">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Alamat Layanan</p>
              <p className="text-sm text-gray-600">{order.customerInfo?.address}</p>
            </div>
          </div>
          
          {order.status === 'ontheway' && (
            <div className="flex items-center space-x-2 text-orange-600">
              <Navigation className="w-4 h-4" />
              <p className="text-sm">Teknisi sedang dalam perjalanan</p>
            </div>
          )}
          
          {order.status === 'arrived' && (
            <div className="flex items-center space-x-2 text-green-600">
              <MapPin className="w-4 h-4" />
              <p className="text-sm">Teknisi telah tiba di lokasi</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
