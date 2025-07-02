import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Share2, Copy, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Service {
  id: number;
  name: string;
  basePrice: string;
  category: string;
  duration: number;
}

interface WhatsAppQuickShareProps {
  preSelectedService?: Service;
  preSelectedAddress?: string;
  customMessage?: string;
  variant?: "button" | "card" | "floating";
  size?: "sm" | "lg" | "default";
}

export function WhatsAppQuickShare({ 
  preSelectedService, 
  preSelectedAddress,
  customMessage,
  variant = "button",
  size = "default"
}: WhatsAppQuickShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>(preSelectedService?.id.toString() || "");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState(preSelectedAddress || "");
  const [notes, setNotes] = useState(customMessage || "");
  const [preferredTime, setPreferredTime] = useState("");
  
  const { toast } = useToast();

  // Fetch available services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  const selectedServiceData = services.find(s => s.id.toString() === selectedService);

  const generateWhatsAppMessage = () => {
    const serviceName = selectedServiceData?.name || "Layanan";
    const servicePrice = selectedServiceData?.basePrice || "Hubungi kami";
    const serviceDuration = selectedServiceData?.duration || "Standar";

    const message = `🚗 *BOOKING TUNTAS KILAT* 🚗

Halo! Saya ingin booking layanan:

📋 *Detail Layanan:*
• Layanan: ${serviceName}
• Estimasi Harga: Rp ${servicePrice}
• Estimasi Waktu: ${serviceDuration} menit

👤 *Info Customer:*
• Nama: ${customerName}
• No. HP: ${customerPhone}

📍 *Alamat:*
${address}

⏰ *Waktu Preferred:*
${preferredTime || "Fleksibel"}

📝 *Catatan Tambahan:*
${notes || "Tidak ada"}

Mohon konfirmasi ketersediaan dan jadwal ya! Terima kasih 🙏`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppShare = () => {
    if (!customerName || !customerPhone || !address || !selectedService) {
      toast({
        title: "Data Belum Lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    const message = generateWhatsAppMessage();
    const whatsappNumber = "6287888881234"; // Nomor CS Tuntas Kilat
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Terbuka",
      description: "Pesan booking telah disiapkan di WhatsApp",
    });
    
    setIsOpen(false);
  };

  const handleCopyMessage = async () => {
    const message = generateWhatsAppMessage();
    const decodedMessage = decodeURIComponent(message);
    
    try {
      await navigator.clipboard.writeText(decodedMessage);
      toast({
        title: "Pesan Disalin",
        description: "Pesan booking telah disalin ke clipboard",
      });
    } catch (error) {
      toast({
        title: "Gagal Menyalin",
        description: "Tidak dapat menyalin pesan ke clipboard",
        variant: "destructive",
      });
    }
  };

  const buttonContent = () => {
    const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : 18;
    
    switch (variant) {
      case "floating":
        return (
          <Button
            size={size}
            className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg"
          >
            <MessageCircle size={24} />
          </Button>
        );
      case "card":
        return (
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium text-green-700 dark:text-green-300">Booking via WhatsApp</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Pesan langsung ke customer service</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <Button size={size} className="bg-green-500 hover:bg-green-600 text-white">
            <MessageCircle size={iconSize} className="mr-2" />
            Booking via WhatsApp
          </Button>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {buttonContent()}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="text-green-500" size={20} />
            Booking via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Isi detail booking dan kirim langsung ke customer service kami
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Nama Lengkap *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama Anda"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">No. WhatsApp *</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="service">Pilih Layanan *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih layanan yang diinginkan" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    <div className="flex justify-between items-center w-full">
                      <span>{service.name}</span>
                      <span className="text-sm text-gray-500 ml-2">Rp {service.basePrice}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="address">Alamat Lengkap *</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masukkan alamat lengkap untuk layanan"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="preferredTime">Waktu Preferred</Label>
            <Input
              id="preferredTime"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              placeholder="Contoh: Besok pagi jam 9, atau fleksibel"
            />
          </div>

          <div>
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan khusus atau permintaan tambahan"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleWhatsAppShare}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              <ExternalLink size={16} className="mr-2" />
              Buka WhatsApp
            </Button>
            <Button 
              onClick={handleCopyMessage}
              variant="outline"
              className="px-3"
            >
              <Copy size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export komponen untuk kemudahan penggunaan
export function WhatsAppFloatingButton(props: Omit<WhatsAppQuickShareProps, 'variant'>) {
  return <WhatsAppQuickShare {...props} variant="floating" />;
}

export function WhatsAppQuickShareCard(props: Omit<WhatsAppQuickShareProps, 'variant'>) {
  return <WhatsAppQuickShare {...props} variant="card" />;
}

export function WhatsAppQuickShareButton(props: Omit<WhatsAppQuickShareProps, 'variant'>) {
  return <WhatsAppQuickShare {...props} variant="button" />;
}