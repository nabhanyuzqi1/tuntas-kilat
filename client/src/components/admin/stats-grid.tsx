import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  Users, 
  DollarSign, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Minus
} from "lucide-react";

interface StatsGridProps {
  analytics: any;
  isLoading: boolean;
}

export default function StatsGrid({ analytics, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      id: 'orders',
      title: 'Total Pesanan Hari Ini',
      value: analytics?.orders?.totalOrders || 247,
      change: '+12%',
      changeType: 'increase',
      subtitle: 'dari kemarin',
      icon: ClipboardList,
      color: 'bg-primary',
    },
    {
      id: 'workers',
      title: 'Teknisi Aktif',
      value: analytics?.workers?.activeWorkers || 18,
      change: 'Semua tersedia',
      changeType: 'neutral',
      subtitle: '',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      id: 'revenue',
      title: 'Pendapatan Bulan Ini',
      value: 'Rp 12.5M',
      change: '+28%',
      changeType: 'increase',
      subtitle: 'dari bulan lalu',
      icon: DollarSign,
      color: 'bg-orange-500',
    },
    {
      id: 'rating',
      title: 'Rating Rata-rata',
      value: '4.8',
      change: '958 ulasan',
      changeType: 'neutral',
      subtitle: '',
      icon: Star,
      color: 'bg-blue-500',
    },
  ];

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-3 h-3" />;
      case 'decrease':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getChangeColor(stat.changeType)} border-0 text-xs`}
                >
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(stat.changeType)}
                    <span>{stat.change}</span>
                  </div>
                </Badge>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </h3>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
