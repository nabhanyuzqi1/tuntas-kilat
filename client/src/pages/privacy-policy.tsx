import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/navbar';
import { ArrowLeft, Shield, Eye, Lock, Users } from 'lucide-react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kebijakan Privasi</h1>
          <p className="text-gray-600 text-lg">
            Terakhir diperbarui: 2 Juli 2025
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Pendahuluan
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Tuntas Kilat ("kami", "perusahaan") berkomitmen untuk melindungi privasi dan keamanan 
                informasi pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, 
                menggunakan, dan melindungi informasi Anda ketika menggunakan layanan kami.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Informasi yang Kami Kumpulkan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Informasi Pribadi</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Nama lengkap</li>
                  <li>Nomor telepon</li>
                  <li>Alamat email</li>
                  <li>Alamat lengkap untuk layanan</li>
                  <li>Informasi pembayaran (diproses oleh penyedia pembayaran pihak ketiga)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Informasi Penggunaan</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Data lokasi untuk penugasan teknisi</li>
                  <li>Riwayat pesanan dan layanan</li>
                  <li>Preferensi dan feedback layanan</li>
                  <li>Komunikasi dengan customer service</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Informasi Teknis</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Alamat IP dan informasi perangkat</li>
                  <li>Data penggunaan aplikasi</li>
                  <li>Log aktivitas sistem</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bagaimana Kami Menggunakan Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Kami menggunakan informasi Anda untuk:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Menyediakan dan mengelola layanan home service</li>
                  <li>Memproses pembayaran dan mengirim konfirmasi</li>
                  <li>Berkomunikasi tentang pesanan dan layanan</li>
                  <li>Meningkatkan kualitas layanan</li>
                  <li>Mengirim update dan promosi (dengan persetujuan)</li>
                  <li>Memenuhi kewajiban hukum</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Pembagian Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Kami tidak menjual, menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga, 
                kecuali dalam situasi berikut:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Dengan teknisi mitra untuk menyelesaikan layanan</li>
                <li>Dengan penyedia pembayaran untuk memproses transaksi</li>
                <li>Dengan penyedia layanan IT untuk operasional platform</li>
                <li>Jika diwajibkan oleh hukum atau peraturan</li>
                <li>Untuk melindungi hak dan keamanan pengguna</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Keamanan Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk 
                melindungi informasi pribadi Anda, termasuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Enkripsi data saat transmisi dan penyimpanan</li>
                <li>Kontrol akses yang ketat</li>
                <li>Monitoring keamanan sistem secara berkala</li>
                <li>Pelatihan keamanan untuk karyawan</li>
                <li>Backup data reguler</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Hak-Hak Anda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">Anda memiliki hak untuk:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Mengakses data pribadi yang kami miliki tentang Anda</li>
                <li>Meminta koreksi data yang tidak akurat</li>
                <li>Meminta penghapusan data pribadi</li>
                <li>Menolak pemrosesan data untuk tujuan pemasaran</li>
                <li>Meminta portabilitas data</li>
                <li>Mengajukan keluhan kepada otoritas perlindungan data</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Penyimpanan Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Kami menyimpan informasi pribadi Anda selama diperlukan untuk menyediakan layanan 
                dan memenuhi kewajiban hukum. Data transaksi disimpan selama 7 tahun sesuai 
                peraturan perpajakan Indonesia.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Perubahan Kebijakan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan material 
                akan diberitahukan melalui email atau notifikasi di platform kami. Penggunaan 
                layanan yang berkelanjutan setelah perubahan menunjukkan penerimaan Anda terhadap 
                kebijakan yang diperbarui.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Hubungi Kami</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau ingin menggunakan 
                hak-hak Anda, silakan hubungi kami:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@tuntaskilat.com</p>
                <p><strong>Telepon:</strong> +62 21 1234 5678</p>
                <p><strong>Alamat:</strong> Jakarta, Indonesia</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-500">
            Dengan menggunakan layanan Tuntas Kilat, Anda menyetujui Kebijakan Privasi ini.
          </p>
        </div>
      </div>
    </div>
  );
}