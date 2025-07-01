import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, LucideIcon } from "lucide-react";

interface ServiceCardProps {
  service: {
    id: number;
    icon: LucideIcon;
    title: string;
    description: string;
    price: string;
    features: string[];
    popular: boolean;
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { icon: Icon, title, description, price, features, popular } = service;

  return (
    <Card className={`hover:shadow-lg transition-shadow ${popular ? 'border-2 border-primary relative' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-orange-500 text-white">
            Populer
          </Badge>
        </div>
      )}
      
      <CardContent className="p-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">Rp {price}</div>
          <Button className="bg-primary hover:bg-primary/90">
            Pesan Sekarang
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
