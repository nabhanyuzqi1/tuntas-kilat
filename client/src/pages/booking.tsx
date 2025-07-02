import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  Car, 
  Bike, 
  Leaf, 
  MapPin, 
  Clock, 
  CreditCard,
  Phone,
  User,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Plus
} from "lucide-react";
import { WhatsAppFloatingButton, WhatsAppQuickShareCard } from "@/components/whatsapp/quick-share-button";

export default function Booking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    serviceName: '',
    serviceCategory: '',
    basePrice: 0,
    customerInfo: {
      name: user?.firstName || '',
      phone: '',
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    serviceDetails: {},
    scheduledTime: '',
    priority: 'normal',
    paymentMethod: 'cash'
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: addresses } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: async (response) => {
      const order = await response.json();
      toast({
        title: "Pesanan Berhasil!",
        description: `ID Pesanan: ${order.trackingId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setLocation(`/tracking/${order.trackingId}`);
    },
    onError: (error) => {
      toast({
        title: "Gagal Membuat Pesanan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'cuci_motor': return Bike;
      case 'cuci_mobil': return Car;
      case 'potong_rumput': return Leaf;
      default: return Car;
    }
  };

  const handleServiceSelect = (service: any) => {
    setBookingData(prev => ({
      ...prev,
      serviceId: service.id.toString(),
      serviceName: service.name,
      serviceCategory: service.category,
      basePrice: parseFloat(service.basePrice)
    }));
    setStep(2);
  };

  const handleLocationSelect = (address: any) => {
    setBookingData(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        address: address.address,
        coordinates: {
          lat: parseFloat(address.latitude) || 0,
          lng: parseFloat(address.longitude) || 0
        }
      }
    }));
  };

  const handleScheduleSelect = (dateTime: string) => {
    setBookingData(prev => ({
      ...prev,
      scheduledTime: dateTime
    }));
    setStep(3);
  };

  const handleServiceDetailsChange = (key: string, value: any) => {
    setBookingData(prev => ({
      ...prev,
      serviceDetails: {
        ...prev.serviceDetails,
        [key]: value
      }
    }));
  };

  const calculateFinalPrice = () => {
    let finalPrice = bookingData.basePrice;
    
    // Add priority surcharge
    if (bookingData.priority === 'express') {
      finalPrice += bookingData.basePrice * 0.3; // 30% surcharge
    } else if (bookingData.priority === 'urgent') {
      finalPrice += bookingData.basePrice * 0.5; // 50% surcharge
    }

    // Add service fee
    const serviceFee = finalPrice * 0.05; // 5% service fee
    
    return {
      basePrice: bookingData.basePrice,
      prioritySurcharge: finalPrice - bookingData.basePrice,
      serviceFee,
      totalPrice: finalPrice + serviceFee
    };
  };

  const handleSubmitOrder = () => {
    const priceCalculation = calculateFinalPrice();
    
    const orderData = {
      ...bookingData,
      basePrice: priceCalculation.basePrice,
      serviceFee: priceCalculation.serviceFee,
      finalAmount: priceCalculation.totalPrice,
      estimatedDuration: 60, // Default 60 minutes
      status: 'pending',
      paymentStatus: 'pending'
    };

    createOrderMutation.mutate(orderData);
  };

  if (servicesLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Memuat layanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pesan Layanan</h1>
              <p className="text-gray-600">Pilih layanan yang Anda butuhkan</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNum
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      step > stepNum ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pilih Layanan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {services?.map((service: any) => {
                const ServiceIcon = getServiceIcon(service.category);
                return (
                  <Card 
                    key={service.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <ServiceIcon className="w-6 h-6 text-primary" />
                        </div>
                        {service.category === 'cuci_mobil' && (
                          <Badge variant="secondary">Populer</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      
                      {service.features && (
                        <ul className="space-y-1 mb-4">
                          {JSON.parse(service.features).slice(0, 3).map((feature: string, index: number) => (
                            <li key={index} className="flex items-center text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          Rp {parseFloat(service.basePrice).toLocaleString()}
                        </div>
                        <Button size="sm">
                          Pilih
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Location & Schedule */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lokasi & Jadwal</h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Pilih Lokasi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses && addresses.length > 0 && (
                    <div>
                      <Label>Alamat Tersimpan</Label>
                      <div className="space-y-2 mt-2">
                        {addresses.map((address: any) => (
                          <div
                            key={address.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              bookingData.customerInfo.address === address.address
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleLocationSelect(address)}
                          >
                            <div className="font-medium">{address.label}</div>
                            <div className="text-sm text-gray-600">{address.address}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="custom-address">Atau Masukkan Alamat Baru</Label>
                    <Textarea
                      id="custom-address"
                      placeholder="Masukkan alamat lengkap..."
                      value={bookingData.customerInfo.address}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        customerInfo: { ...prev.customerInfo, address: e.target.value }
                      }))}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08xxx"
                      value={bookingData.customerInfo.phone}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        customerInfo: { ...prev.customerInfo, phone: e.target.value }
                      }))}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Pilih Jadwal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="schedule-date">Tanggal & Waktu</Label>
                    <Input
                      id="schedule-date"
                      type="datetime-local"
                      value={bookingData.scheduledTime}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        scheduledTime: e.target.value
                      }))}
                      min={new Date().toISOString().slice(0, 16)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Prioritas</Label>
                    <RadioGroup
                      value={bookingData.priority}
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, priority: value }))}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="normal" />
                        <Label htmlFor="normal">Normal - Tidak ada biaya tambahan</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express">Express - +30% (prioritas tinggi)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="urgent" id="urgent" />
                        <Label htmlFor="urgent">Urgent - +50% (segera)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setStep(3)}
                    disabled={!bookingData.customerInfo.address || !bookingData.customerInfo.phone || !bookingData.scheduledTime}
                  >
                    Lanjutkan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Service Details */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Layanan</h2>
            
            <Card>
              <CardContent className="p-6">
                {bookingData.serviceCategory === 'cuci_motor' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="plate-number">Nomor Plat Kendaraan</Label>
                      <Input
                        id="plate-number"
                        placeholder="B 1234 XYZ"
                        value={bookingData.serviceDetails.plateNumber || ''}
                        onChange={(e) => handleServiceDetailsChange('plateNumber', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle-type">Jenis Motor</Label>
                      <Input
                        id="vehicle-type"
                        placeholder="Honda Vario, Yamaha NMAX, dll"
                        value={bookingData.serviceDetails.vehicleType || ''}
                        onChange={(e) => handleServiceDetailsChange('vehicleType', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {bookingData.serviceCategory === 'cuci_mobil' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="plate-number">Nomor Plat Kendaraan</Label>
                      <Input
                        id="plate-number"
                        placeholder="B 1234 XYZ"
                        value={bookingData.serviceDetails.plateNumber || ''}
                        onChange={(e) => handleServiceDetailsChange('plateNumber', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle-brand">Merk/Model Mobil</Label>
                      <Input
                        id="vehicle-brand"
                        placeholder="Toyota Avanza, Honda Civic, dll"
                        value={bookingData.serviceDetails.vehicleBrand || ''}
                        onChange={(e) => handleServiceDetailsChange('vehicleBrand', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle-color">Warna Kendaraan</Label>
                      <Input
                        id="vehicle-color"
                        placeholder="Putih, Hitam, Merah, dll"
                        value={bookingData.serviceDetails.vehicleColor || ''}
                        onChange={(e) => handleServiceDetailsChange('vehicleColor', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {bookingData.serviceCategory === 'potong_rumput' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="area-size">Perkiraan Luas Area (m²)</Label>
                      <Input
                        id="area-size"
                        type="number"
                        placeholder="100"
                        value={bookingData.serviceDetails.areaSize || ''}
                        onChange={(e) => handleServiceDetailsChange('areaSize', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Tipe Rumah</Label>
                      <Select
                        value={bookingData.serviceDetails.houseType || ''}
                        onValueChange={(value) => handleServiceDetailsChange('houseType', value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Pilih tipe rumah" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Rumah Kecil</SelectItem>
                          <SelectItem value="medium">Rumah Sedang</SelectItem>
                          <SelectItem value="large">Rumah Besar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tinggi Rumput</Label>
                      <Select
                        value={bookingData.serviceDetails.grassHeight || ''}
                        onValueChange={(value) => handleServiceDetailsChange('grassHeight', value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Pilih tinggi rumput" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Rendah (&lt; 10cm)</SelectItem>
                          <SelectItem value="medium">Sedang (10-20cm)</SelectItem>
                          <SelectItem value="high">Tinggi (&gt; 20cm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Label htmlFor="additional-notes">Catatan Tambahan (Opsional)</Label>
                  <Textarea
                    id="additional-notes"
                    placeholder="Instruksi khusus atau informasi tambahan..."
                    value={bookingData.serviceDetails.additionalNotes || ''}
                    onChange={(e) => handleServiceDetailsChange('additionalNotes', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={() => setStep(4)}
                >
                  Lanjutkan ke Pembayaran
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Payment & Confirmation */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Konfirmasi & Pembayaran</h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {(() => {
                        const ServiceIcon = getServiceIcon(bookingData.serviceCategory);
                        return <ServiceIcon className="w-5 h-5 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-semibold">{bookingData.serviceName}</p>
                      <p className="text-sm text-gray-600">{bookingData.serviceCategory}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{bookingData.customerInfo.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(bookingData.scheduledTime).toLocaleDateString('id-ID')} - {' '}
                        {new Date(bookingData.scheduledTime).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{bookingData.customerInfo.phone}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Harga Dasar</span>
                      <span>Rp {calculateFinalPrice().basePrice.toLocaleString()}</span>
                    </div>
                    {calculateFinalPrice().prioritySurcharge > 0 && (
                      <div className="flex justify-between">
                        <span>Biaya Prioritas</span>
                        <span>Rp {calculateFinalPrice().prioritySurcharge.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Biaya Layanan (5%)</span>
                      <span>Rp {calculateFinalPrice().serviceFee.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">Rp {calculateFinalPrice().totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Metode Pembayaran</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={bookingData.paymentMethod}
                    onValueChange={(value) => setBookingData(prev => ({ ...prev, paymentMethod: value }))}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1">Cash (Bayar di Tempat)</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="qris" id="qris" />
                      <Label htmlFor="qris" className="flex-1">QRIS</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer" className="flex-1">Transfer Bank</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="ewallet" id="ewallet" />
                      <Label htmlFor="ewallet" className="flex-1">E-Wallet (GoPay, OVO, Dana)</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="cc" id="cc" />
                      <Label htmlFor="cc" className="flex-1">Kartu Kredit/Debit</Label>
                    </div>
                  </RadioGroup>

                  <Button
                    className="w-full mt-6"
                    onClick={handleSubmitOrder}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? 'Memproses...' : 'Konfirmasi Pesanan'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Floating WhatsApp Button */}
      <WhatsAppFloatingButton />
    </div>
  );
}
