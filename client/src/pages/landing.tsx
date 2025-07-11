import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ServiceCard from "@/components/services/service-card";
import WhatsAppInterface from "@/components/chat/whatsapp-interface";
import { Link } from "wouter";
import { 
  Car, 
  Bike, 
  Leaf, 
  Clock, 
  Star, 
  Shield, 
  CreditCard, 
  MapPin, 
  CheckCircle, 
  Users,
  BarChart3,
  MessageSquare,
  Map,
  UserCheck,
  Award,
  Gift,
  Facebook,
  Instagram,
  X
} from "lucide-react";

export default function Landing() {
  const [showChat, setShowChat] = useState(false);
  
  const services = [
    {
      id: 1,
      icon: Bike,
      title: "Cuci Motor",
      description: "Layanan cuci motor profesional dengan sabun berkualitas dan peralatan modern",
      price: "25.000",
      features: ["Cuci bersih + poles", "Pembersihan rantai", "Vakum jok motor"],
      popular: false
    },
    {
      id: 2,
      icon: Car,
      title: "Cuci Mobil",
      description: "Cuci mobil lengkap dengan shampo khusus dan treatment interior",
      price: "50.000",
      features: ["Cuci eksterior & interior", "Vakum kursi & karpet", "Pembersihan velg", "Pengharum ruangan"],
      popular: true
    },
    {
      id: 3,
      icon: Leaf,
      title: "Potong Rumput",
      description: "Jasa potong rumput untuk halaman rumah dengan peralatan profesional",
      price: "75.000",
      features: ["Potong rumput halaman", "Rapikan tepi", "Bersihkan sisa rumput"],
      popular: false
    }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: "Pesan via WhatsApp",
      description: "Tidak perlu install aplikasi. Pesan langsung via WhatsApp dengan AI assistant yang membantu 24/7"
    },
    {
      icon: Map,
      title: "Live Tracking",
      description: "Pantau teknisi secara real-time dari berangkat hingga selesai dengan notifikasi otomatis"
    },
    {
      icon: UserCheck,
      title: "Teknisi Terverifikasi",
      description: "Semua teknisi telah melewati proses seleksi ketat dan pelatihan profesional"
    },
    {
      icon: CreditCard,
      title: "Pembayaran Fleksibel",
      description: "Bayar cash, QRIS, transfer bank, e-wallet, atau kartu kredit sesuai kenyamanan Anda"
    },
    {
      icon: Shield,
      title: "Garansi Layanan",
      description: "Jaminan kepuasan 100% dengan garansi ulang gratis jika tidak puas dengan hasil"
    },
    {
      icon: Gift,
      title: "Program Membership",
      description: "Dapatkan diskon dan benefit eksklusif dengan sistem membership bertingkat"
    }
  ];

  const stats = [
    { icon: BarChart3, label: "Total Pesanan Selama Ini", value: "15,247", change: "Dalam 2 tahun operasi" },
    { icon: Users, label: "Teknisi Aktif", value: "18", change: "Semua tersedia" },
    { icon: CheckCircle, label: "Tingkat Kepuasan", value: "98%", change: "Dari 1,245 ulasan" },
    { icon: Star, label: "Rating Rata-rata", value: "4.8", change: "958 ulasan terverifikasi" }
  ];

  return (
    <div className="min-h-screen bg-stone">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Layanan Terbaik untuk 
                <span className="text-yellow-300"> Kendaraan & Rumah</span> Anda
              </h1>
              <p className="text-xl mb-8 text-teal-100">
                Cuci motor, cuci mobil, dan potong rumput dengan kualitas profesional. 
                Pesan via WhatsApp, pantau real-time!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 hover:text-primary transition-all duration-300 font-semibold"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Login & Pesan Sekarang
                  </Button>
                </Link>
                <Link href="/services">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary transition-all duration-300 font-semibold"
                  >
                    Lihat Harga
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-lg p-4 text-center text-white">
                      <Bike className="w-8 h-8 mx-auto mb-2 text-white" />
                      <p className="text-sm text-white">Cuci Motor</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center text-white">
                      <Car className="w-8 h-8 mx-auto mb-2 text-white" />
                      <p className="text-sm text-white">Cuci Mobil</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center text-white">
                      <Leaf className="w-8 h-8 mx-auto mb-2 text-white" />
                      <p className="text-sm text-white">Potong Rumput</p>
                    </div>
                    <div className="bg-yellow-400/90 rounded-lg p-4 text-center text-gray-800">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-800" />
                      <p className="text-sm font-semibold text-gray-800">24/7 Service</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Layanan Kami</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tiga layanan utama dengan kualitas terjamin dan teknisi berpengalaman
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Chat Interface Demo */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Chat via WhatsApp</h2>
            <p className="text-xl text-gray-600">
              Pesan layanan mudah dengan AI assistant yang siap membantu 24/7
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <WhatsAppInterface />
          </div>
        </div>
      </section>

      {/* Demo Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Platform Terpercaya</h2>
            <p className="text-xl text-gray-600">
              Data real-time menunjukkan kepercayaan pelanggan dan kualitas layanan kami
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-primary text-xs">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Mengapa Pilih Gercep?</h2>
            <p className="text-xl text-gray-600">
              Platform terlengkap dengan teknologi terdepan untuk layanan terbaik
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Siap Merasakan Layanan Terbaik?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Bergabung dengan ribuan pelanggan yang sudah merasakan kemudahan dan kualitas layanan Tuntas Kilat
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 hover:text-primary transition-all duration-300 font-semibold"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                Pesan via WhatsApp
              </Button>
            </Link>
            <Link href="/services">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary transition-all duration-300 font-semibold"
              >
                Lihat Harga
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Tuntas Kilat</h3>
                  <p className="text-sm text-gray-400">Service On Demand</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Platform layanan terpercaya untuk cuci kendaraan dan potong rumput dengan teknologi modern
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services" className="hover:text-primary transition-colors">Cuci Motor</Link></li>
                <li><Link href="/services" className="hover:text-primary transition-colors">Cuci Mobil</Link></li>
                <li><Link href="/services" className="hover:text-primary transition-colors">Potong Rumput</Link></li>
                <li><Link href="/services" className="hover:text-primary transition-colors">Paket Berlangganan</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">Karir</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">Press Kit</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">Hubungi Kami</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tuntas Kilat. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg" 
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 animate-bounce shadow-lg"
          onClick={() => setShowChat(true)}
        >
          <MessageSquare className="w-8 h-8" />
        </Button>
      </div>

      {/* WhatsApp Chat Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Chat dengan Tuntas Kilat Assistant</DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10 bg-white hover:bg-gray-100 rounded-full w-8 h-8 p-0 shadow-md"
              onClick={() => setShowChat(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <WhatsAppInterface />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
