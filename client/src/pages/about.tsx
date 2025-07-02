import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/navbar';
import { 
  Target, 
  Heart, 
  Users, 
  Award, 
  Clock, 
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { Link } from 'wouter';

export default function About() {
  const features = [
    {
      icon: Clock,
      title: "Pelayanan Cepat",
      description: "Teknisi tiba dalam 30 menit setelah booking konfirmasi"
    },
    {
      icon: Shield,
      title: "Garansi Layanan",
      description: "100% garansi kepuasan atau layanan ulang gratis"
    },
    {
      icon: Users,
      title: "Teknisi Berpengalaman",
      description: "Tim teknisi terlatih dengan sertifikat dan pengalaman minimum 2 tahun"
    },
    {
      icon: Zap,
      title: "Teknologi Modern",
      description: "Peralatan dan metode pembersihan menggunakan teknologi terkini"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Fokus pada Kualitas",
      description: "Kami berkomitmen memberikan hasil terbaik dengan standar tinggi di setiap layanan"
    },
    {
      icon: Heart,
      title: "Peduli Pelanggan",
      description: "Kepuasan dan kenyamanan pelanggan adalah prioritas utama dalam setiap interaksi"
    },
    {
      icon: Award,
      title: "Integritas Tinggi",
      description: "Transparansi harga, kejujuran dalam layanan, dan komitmen pada janji"
    }
  ];

  const achievements = [
    { number: "15,000+", label: "Pesanan Berhasil" },
    { number: "98%", label: "Tingkat Kepuasan" },
    { number: "18", label: "Teknisi Aktif" },
    { number: "24/7", label: "Customer Support" }
  ];

  const team = [
    {
      name: "Ahmad Rizki",
      role: "CEO & Founder",
      description: "Visioner yang membangun Tuntas Kilat dari pengalaman pribadi dalam industri home service"
    },
    {
      name: "Siti Nurhaliza",
      role: "Head of Operations",
      description: "Ahli operasional dengan 8 tahun pengalaman dalam manajemen layanan pelanggan"
    },
    {
      name: "Budi Santoso",
      role: "Lead Technician",
      description: "Teknisi senior dengan 10 tahun pengalaman dalam automotive dan home care services"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tentang <span className="text-primary">Tuntas Kilat</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Platform layanan rumah tangga terdepan yang menghadirkan solusi praktis dan terpercaya 
            untuk kebutuhan cuci kendaraan dan perawatan taman Anda.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Misi Kami</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Memberikan layanan home service berkualitas tinggi dengan standar profesional, 
                menghadirkan kemudahan dan kepercayaan dalam setiap interaksi, serta membangun 
                ekosistem yang berkelanjutan untuk teknisi lokal.
              </p>
            </CardContent>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Visi Kami</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Menjadi platform home service terpercaya nomor satu di Indonesia yang menghubungkan 
                kebutuhan masyarakat dengan layanan berkualitas, mendorong pertumbuhan ekonomi lokal, 
                dan menciptakan standar baru dalam industri layanan rumah tangga.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih Tuntas Kilat?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menghadirkan pengalaman layanan yang berbeda dengan fokus pada kualitas, 
              kecepatan, dan kepuasan pelanggan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nilai-Nilai Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fondasi yang menguatkan setiap keputusan dan tindakan dalam memberikan layanan terbaik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <value.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Pencapaian Kami</h2>
              <p className="text-gray-600">Angka-angka yang menunjukkan kepercayaan dan kepuasan pelanggan</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {achievement.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tim Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dibelakang layanan berkualitas, ada tim profesional yang berdedikasi tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="p-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <div className="text-primary font-medium mb-3">{member.role}</div>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Siap Merasakan Layanan Terbaik?</h2>
            <p className="text-lg mb-6 text-primary-foreground/90">
              Bergabunglah dengan ribuan pelanggan yang telah merasakan kepuasan layanan Tuntas Kilat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" variant="secondary" className="flex items-center gap-2">
                  Lihat Layanan
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="bg-white text-primary border-white hover:bg-gray-50">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}