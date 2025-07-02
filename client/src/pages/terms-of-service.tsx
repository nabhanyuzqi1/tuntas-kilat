import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/navbar';
import { ArrowLeft, FileText, AlertTriangle, Scale, Clock } from 'lucide-react';
import { Link } from 'wouter';

export default function TermsOfService() {
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
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Syarat dan Ketentuan</h1>
          <p className="text-gray-600 text-lg">
            Terakhir diperbarui: 2 Juli 2025
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Pendahuluan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Selamat datang di Tuntas Kilat. Syarat dan Ketentuan ini mengatur penggunaan layanan 
                home service yang disediakan oleh PT Tuntas Kilat Indonesia ("Perusahaan"). Dengan 
                menggunakan layanan kami, Anda menyetujui untuk terikat dengan syarat dan ketentuan berikut.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>Deskripsi Layanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Tuntas Kilat adalah platform yang menghubungkan pelanggan dengan teknisi profesional 
                untuk layanan:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Cuci kendaraan (motor dan mobil)</li>
                <li>Perawatan taman dan potong rumput</li>
                <li>Layanan home service lainnya yang akan ditambahkan</li>
              </ul>
              <p className="text-gray-700">
                Kami bertindak sebagai perantara antara pelanggan dan teknisi, memfasilitasi pemesanan, 
                pembayaran, dan koordinasi layanan.
              </p>
            </CardContent>
          </Card>

          {/* User Obligations */}
          <Card>
            <CardHeader>
              <CardTitle>Kewajiban Pengguna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-gray-900">Sebagai pengguna, Anda wajib:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Memberikan informasi yang akurat dan lengkap</li>
                <li>Hadir di lokasi sesuai jadwal yang telah disepakati</li>
                <li>Memberikan akses yang memadai untuk teknisi</li>
                <li>Melakukan pembayaran sesuai dengan tarif yang berlaku</li>
                <li>Memperlakukan teknisi dengan hormat dan profesional</li>
                <li>Melaporkan masalah atau keluhan melalui saluran resmi</li>
                <li>Tidak menggunakan layanan untuk aktivitas ilegal</li>
              </ul>
            </CardContent>
          </Card>

          {/* Booking and Cancellation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Pemesanan dan Pembatalan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pemesanan</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Pemesanan dapat dilakukan melalui platform atau WhatsApp</li>
                  <li>Konfirmasi pemesanan akan diberikan dalam maksimal 30 menit</li>
                  <li>Harga final akan dikonfirmasi sebelum teknisi berangkat</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pembatalan</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Pembatalan gratis jika dilakukan minimal 2 jam sebelum jadwal</li>
                  <li>Pembatalan kurang dari 2 jam dikenakan biaya administrasi 25%</li>
                  <li>Pembatalan setelah teknisi berangkat dikenakan biaya transportasi</li>
                  <li>No-show (tidak ada di lokasi) dikenakan biaya penuh</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Ketentuan Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Pembayaran dapat dilakukan via cash, transfer bank, e-wallet, atau kartu kredit</li>
                <li>Harga sudah termasuk PPN 11%</li>
                <li>Biaya tambahan dapat dikenakan untuk layanan di luar area standar</li>
                <li>Tarif dapat berubah sewaktu-waktu dengan pemberitahuan sebelumnya</li>
                <li>Refund akan diproses dalam 3-7 hari kerja untuk pembatalan yang memenuhi syarat</li>
              </ul>
            </CardContent>
          </Card>

          {/* Service Guarantee */}
          <Card>
            <CardHeader>
              <CardTitle>Garansi Layanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Garansi Kepuasan</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Garansi 100% kepuasan atau layanan ulang gratis</li>
                  <li>Klaim garansi harus dilaporkan dalam 24 jam setelah layanan</li>
                  <li>Penilaian garansi berdasarkan standar kualitas yang objektif</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pengecualian Garansi</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Kerusakan yang sudah ada sebelumnya</li>
                  <li>Kondisi cuaca ekstrem yang mempengaruhi hasil</li>
                  <li>Keterbatasan akses atau fasilitas di lokasi</li>
                  <li>Permintaan khusus di luar standar layanan</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Batasan Tanggung Jawab
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tanggung Jawab Perusahaan</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Memastikan teknisi terlatih dan bersertifikat</li>
                  <li>Menyediakan peralatan standar yang memadai</li>
                  <li>Mengasuransikan teknisi untuk kecelakaan kerja</li>
                  <li>Mengganti kerusakan yang disebabkan kelalaian teknisi</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pengecualian Tanggung Jawab</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Kerusakan pada properti yang sudah rapuh atau rusak</li>
                  <li>Kehilangan barang berharga yang tidak diamankan</li>
                  <li>Kerusakan akibat force majeure (bencana alam, dll)</li>
                  <li>Kerugian tidak langsung atau kehilangan keuntungan</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Hak Kekayaan Intelektual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Semua konten, merek dagang, logo, dan kekayaan intelektual lainnya di platform 
                Tuntas Kilat adalah milik Perusahaan dan dilindungi oleh hukum yang berlaku.
              </p>
              <p className="text-gray-700">
                Pengguna dilarang menggunakan, menyalin, atau mendistribusikan konten kami 
                tanpa izin tertulis yang jelas.
              </p>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Privasi dan Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Penggunaan data pribadi Anda diatur dalam 
                <Link href="/privacy-policy" className="text-primary hover:underline mx-1">
                  Kebijakan Privasi
                </Link>
                kami yang merupakan bagian integral dari Syarat dan Ketentuan ini.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Penghentian Layanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Kami berhak menghentikan atau menangguhkan akses Anda ke layanan kami jika:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Melanggar syarat dan ketentuan ini</li>
                <li>Memberikan informasi palsu atau menyesatkan</li>
                <li>Melakukan aktivitas yang merugikan Perusahaan atau pengguna lain</li>
                <li>Tidak melakukan pembayaran sesuai ketentuan</li>
                <li>Berperilaku tidak pantas terhadap teknisi</li>
              </ul>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card>
            <CardHeader>
              <CardTitle>Penyelesaian Sengketa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Jika terjadi sengketa, prioritas kami adalah menyelesaikan secara musyawarah. 
                Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-1 ml-4">
                <li>Mediasi oleh lembaga mediasi yang disepakati</li>
                <li>Arbitrase sesuai aturan BANI (Badan Arbitrase Nasional Indonesia)</li>
                <li>Pengadilan Negeri Jakarta Pusat sebagai pilihan terakhir</li>
              </ol>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Perubahan Syarat dan Ketentuan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Kami berhak mengubah Syarat dan Ketentuan ini kapan saja. Perubahan material 
                akan diberitahukan melalui email atau notifikasi di platform minimal 7 hari 
                sebelum berlaku. Penggunaan layanan setelah perubahan menunjukkan penerimaan 
                Anda terhadap syarat yang baru.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Untuk pertanyaan terkait Syarat dan Ketentuan ini, silakan hubungi:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@tuntaskilat.com</p>
                <p><strong>Customer Service:</strong> +62 21 1234 5678</p>
                <p><strong>Alamat:</strong> Jakarta, Indonesia</p>
                <p><strong>Jam Operasional:</strong> Senin-Minggu, 06:00-22:00 WIB</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-500">
            Dengan menggunakan layanan Tuntas Kilat, Anda menyetujui Syarat dan Ketentuan ini.
          </p>
        </div>
      </div>
    </div>
  );
}