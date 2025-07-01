import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  User, 
  MapPin, 
  Settings, 
  Star,
  AlertCircle
} from "lucide-react";

interface OrderStatusProps {
  order: any;
}

export default function OrderStatus({ order }: OrderStatusProps) {
  const getStatusSteps = () => {
    const allSteps = [
      {
        id: 'pending',
        title: 'Pesanan Dikonfirmasi',
        description: 'Pesanan Anda telah diterima',
        icon: CheckCircle,
        completed: ['confirmed', 'assigned', 'ontheway', 'arrived', 'inprogress', 'completed'].includes(order.status)
      },
      {
        id: 'assigned',
        title: 'Teknisi Ditemukan',
        description: 'Teknisi telah ditugaskan',
        icon: User,
        completed: ['assigned', 'ontheway', 'arrived', 'inprogress', 'completed'].includes(order.status)
      },
      {
        id: 'ontheway',
        title: 'Dalam Perjalanan',
        description: 'Teknisi sedang menuju lokasi',
        icon: MapPin,
        completed: ['ontheway', 'arrived', 'inprogress', 'completed'].includes(order.status),
        active: order.status === 'ontheway'
      },
      {
        id: 'arrived',
        title: 'Tiba di Lokasi',
        description: 'Teknisi telah sampai',
        icon: CheckCircle,
        completed: ['arrived', 'inprogress', 'completed'].includes(order.status),
        active: order.status === 'arrived'
      },
      {
        id: 'inprogress',
        title: 'Sedang Dikerjakan',
        description: 'Layanan sedang berlangsung',
        icon: Settings,
        completed: ['completed'].includes(order.status),
        active: order.status === 'inprogress'
      },
      {
        id: 'completed',
        title: 'Selesai',
        description: 'Layanan telah selesai',
        icon: Star,
        completed: order.status === 'completed',
        active: order.status === 'completed'
      }
    ];

    // Filter out steps based on current status
    if (order.status === 'pending') {
      return allSteps.slice(0, 1);
    } else if (order.status === 'confirmed') {
      return allSteps.slice(0, 2);
    } else {
      return allSteps;
    }
  };

  const getStatusMessage = () => {
    switch (order.status) {
      case 'pending':
        return { 
          message: 'Pesanan Anda sedang diproses. Mohon tunggu konfirmasi.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: Clock
        };
      case 'confirmed':
        return { 
          message: 'Pesanan dikonfirmasi. Kami sedang mencari teknisi terdekat.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: Clock
        };
      case 'assigned':
        return { 
          message: 'Teknisi telah ditugaskan dan sedang bersiap.',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          icon: User
        };
      case 'ontheway':
        return { 
          message: 'Teknisi sedang dalam perjalanan ke lokasi Anda.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          icon: MapPin
        };
      case 'arrived':
        return { 
          message: 'Teknisi telah tiba. Layanan akan segera dimulai.',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          icon: CheckCircle
        };
      case 'inprogress':
        return { 
          message: 'Layanan sedang berlangsung. Mohon tunggu hingga selesai.',
          color: 'text-primary',
          bgColor: 'bg-teal-50',
          icon: Settings
        };
      case 'completed':
        return { 
          message: 'Layanan telah selesai. Terima kasih atas kepercayaan Anda!',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: Star
        };
      case 'cancelled':
        return { 
          message: 'Pesanan dibatalkan. Hubungi customer service jika ada pertanyaan.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: AlertCircle
        };
      default:
        return { 
          message: 'Status pesanan tidak diketahui.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: Clock
        };
    }
  };

  const statusMessage = getStatusMessage();
  const StatusIcon = statusMessage.icon;
  const steps = getStatusSteps();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status Message */}
        <div className={`${statusMessage.bgColor} border border-opacity-20 rounded-lg p-4`}>
          <div className="flex items-center space-x-3">
            <StatusIcon className={`w-5 h-5 ${statusMessage.color}`} />
            <p className={`${statusMessage.color} font-medium`}>
              {statusMessage.message}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : step.active
                        ? 'bg-primary border-primary text-white animate-pulse'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${
                        step.completed || step.active
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={`text-sm ${
                        step.completed || step.active
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Timestamp */}
                  {step.completed && order.timeline && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {(() => {
                          const timelineEntry = Array.isArray(order.timeline) 
                            ? order.timeline.find((entry: any) => entry.status === step.id)
                            : null;
                          return timelineEntry 
                            ? formatTime(timelineEntry.timestamp)
                            : '';
                        })()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-5 top-10 w-0.5 h-6 bg-gray-200"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Order Details */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ID Pesanan:</span>
            <span className="font-medium">{order.trackingId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Waktu Pesan:</span>
            <span className="font-medium">
              {new Date(order.createdAt).toLocaleDateString('id-ID')} {' '}
              {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Jadwal Layanan:</span>
            <span className="font-medium">
              {new Date(order.scheduledTime).toLocaleDateString('id-ID')} {' '}
              {new Date(order.scheduledTime).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          {order.estimatedDuration && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimasi Durasi:</span>
              <span className="font-medium">{order.estimatedDuration} menit</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
