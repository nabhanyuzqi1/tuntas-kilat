import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle,
  Star,
  Gift
} from "lucide-react";

interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

interface Order {
  id: number;
  trackingId: string;
  serviceName: string;
  status: string;
  scheduledTime: string;
  finalAmount: string;
  rating?: number;
  review?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // User profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/profile'],
  });

  // Addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['/api/addresses'],
  });

  // Order history
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders/history'],
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Profil berhasil diperbarui" });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal memperbarui profil", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Address mutations
  const createAddressMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Alamat berhasil ditambahkan" });
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      setShowAddAddress(false);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest(`/api/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Alamat berhasil diperbarui" });
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      setEditingAddress(null);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/addresses/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({ title: "Alamat berhasil dihapus" });
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const AddressForm = ({ address, onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState({
      name: address?.name || '',
      address: address?.address || '',
      city: address?.city || '',
      latitude: address?.latitude || 0,
      longitude: address?.longitude || 0,
      isDefault: address?.isDefault || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nama Lokasi</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Rumah, Kantor, dll"
            required
          />
        </div>
        <div>
          <Label htmlFor="address">Alamat Lengkap</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Jalan, nomor rumah, RT/RW"
            required
          />
        </div>
        <div>
          <Label htmlFor="city">Kota</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="Kota"
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={createAddressMutation.isPending || updateAddressMutation.isPending}>
            {address ? 'Perbarui' : 'Tambah'} Alamat
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        </div>
      </form>
    );
  };

  if (profileLoading || addressesLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p>Loading profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Profil Saya</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="addresses">Alamat</TabsTrigger>
            <TabsTrigger value="orders">Riwayat Order</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input
                      id="firstName"
                      defaultValue={profile?.firstName || user?.firstName || ''}
                      placeholder="Nama depan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input
                      id="lastName"
                      defaultValue={profile?.lastName || user?.lastName || ''}
                      placeholder="Nama belakang"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={profile?.email || user?.email || ''}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input
                      id="phone"
                      defaultValue={profile?.phone || ''}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => updateProfileMutation.mutate({})}
                  disabled={updateProfileMutation.isPending}
                >
                  Simpan Perubahan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Alamat Tersimpan</h2>
                <Button onClick={() => setShowAddAddress(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Alamat
                </Button>
              </div>

              {showAddAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tambah Alamat Baru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddressForm
                      onSubmit={(data: any) => createAddressMutation.mutate(data)}
                      onCancel={() => setShowAddAddress(false)}
                    />
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {addresses.map((address: Address) => (
                  <Card key={address.id}>
                    <CardContent className="pt-6">
                      {editingAddress?.id === address.id ? (
                        <AddressForm
                          address={address}
                          onSubmit={(data: any) => updateAddressMutation.mutate({ id: address.id, data })}
                          onCancel={() => setEditingAddress(null)}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{address.name}</span>
                              {address.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <p className="text-gray-600">{address.address}</p>
                            <p className="text-sm text-gray-500">{address.city}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAddress(address)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteAddressMutation.mutate(address.id)}
                              disabled={deleteAddressMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Riwayat Pesanan</h2>
              
              <div className="grid gap-4">
                {orders.map((order: Order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{order.serviceName}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            ID: {order.trackingId}
                          </p>
                          <p className="text-sm text-gray-600">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {new Date(order.scheduledTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">Rp {Number(order.finalAmount).toLocaleString()}</p>
                          {order.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{order.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {order.status === 'completed' && !order.rating && (
                        <Button size="sm" variant="outline">
                          Beri Rating
                        </Button>
                      )}
                      
                      {order.review && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">{order.review}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}