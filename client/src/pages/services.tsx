import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/navbar';
import { Car, Bike, Leaf, Clock, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const services = [
    {
      id: 1,
      icon: Bike,
      title: "Cuci Motor",
      description: "Layanan cuci motor profesional dengan sabun berkualitas dan peralatan modern",
      basePrice: "25.000",
      duration: 30,
      category: "motor",
      features: ["Cuci bersih + poles", "Pembersihan rantai", "Vakum jok motor"],
      popular: false,
      rating: 4.8,
      totalOrders: 1247
    },
    {
      id: 2,
      icon: Car,
      title: "Cuci Mobil",
      description: "Cuci mobil lengkap dengan shampo khusus dan treatment interior",
      basePrice: "50.000",
      duration: 60,
      category: "mobil",
      features: ["Cuci eksterior & interior", "Vakum kursi & karpet", "Pembersihan velg", "Pengharum ruangan"],
      popular: true,
      rating: 4.9,
      totalOrders: 892
    },
    {
      id: 3,
      icon: Leaf,
      title: "Potong Rumput",
      description: "Jasa potong rumput untuk halaman rumah dengan peralatan profesional",
      basePrice: "75.000",
      duration: 90,
      category: "taman",
      features: ["Potong rumput halaman", "Rapikan tepi", "Bersihkan sisa rumput"],
      popular: false,
      rating: 4.7,
      totalOrders: 543
    },
    {
      id: 4,
      icon: Car,
      title: "Cuci Mobil Premium",
      description: "Layanan cuci mobil premium dengan wax dan poles body komprehensif",
      basePrice: "85.000",
      duration: 90,
      category: "mobil",
      features: ["Cuci eksterior & interior", "Wax & poles body", "Detailing engine bay", "Treatment dashboard"],
      popular: false,
      rating: 4.9,
      totalOrders: 234
    },
    {
      id: 5,
      icon: Bike,
      title: "Cuci Motor Premium",
      description: "Paket cuci motor premium dengan treatment khusus dan poles body",
      basePrice: "40.000",
      duration: 45,
      category: "motor",
      features: ["Cuci bersih + poles premium", "Treatment rantai", "Vakum jok + dashboard", "Pengharum"],
      popular: false,
      rating: 4.8,
      totalOrders: 687
    },
    {
      id: 6,
      icon: Leaf,
      title: "Perawatan Taman",
      description: "Layanan lengkap perawatan taman termasuk pemangkasan dan penyiraman",
      basePrice: "120.000",
      duration: 120,
      category: "taman",
      features: ["Potong rumput", "Pemangkasan tanaman", "Penyiraman", "Pembersihan area"],
      popular: false,
      rating: 4.6,
      totalOrders: 156
    }
  ];

  const categories = [
    { id: 'all', label: 'Semua Layanan' },
    { id: 'motor', label: 'Cuci Motor' },
    { id: 'mobil', label: 'Cuci Mobil' },
    { id: 'taman', label: 'Perawatan Taman' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseInt(price));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Layanan Kami</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pilih layanan terbaik untuk kebutuhan Anda dengan kualitas profesional dan harga terjangkau
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="transition-all duration-200"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {service.popular && (
                <Badge className="absolute top-4 right-4 bg-orange-500 text-white">
                  Populer
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{service.rating}</span>
                      <span>({service.totalOrders} pesanan)</span>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price and Duration */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(service.basePrice)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} menit</span>
                    </div>
                  </div>
                  
                  <Link href="/booking">
                    <Button className="flex items-center gap-2">
                      Pesan Sekarang
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tidak Menemukan Layanan yang Anda Cari?
            </h2>
            <p className="text-gray-600 mb-6">
              Hubungi tim customer service kami untuk konsultasi layanan custom sesuai kebutuhan Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="flex items-center gap-2">
                  Konsultasi Gratis
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Hubungi Customer Service
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}