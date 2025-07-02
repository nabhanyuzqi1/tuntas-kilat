import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  MessageSquare, 
  Send, 
  Calendar, 
  TrendingUp, 
  Filter,
  Plus,
  Mail,
  Phone,
  Gift,
  Target,
  Clock,
  CheckCircle
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'active' | 'inactive' | 'vip';
  segment: string;
}

interface Campaign {
  id: string;
  name: string;
  type: 'birthday' | 'anniversary' | 'reengagement' | 'promotion' | 'reminder';
  message: string;
  targetSegment: string;
  scheduledDate: string;
  status: 'draft' | 'scheduled' | 'sent' | 'completed';
  sentCount: number;
  responseRate: number;
}

export default function CRMDashboard() {
  const { toast } = useToast();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [filterSegment, setFilterSegment] = useState('all');
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'promotion',
    message: '',
    targetSegment: 'all',
    scheduledDate: ''
  });

  // Customer data
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['/api/admin/customers', filterSegment],
    queryFn: () => apiRequest(`/api/admin/customers?segment=${filterSegment}`),
  });

  // Campaign data
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/admin/campaigns'],
  });

  // Customer segments
  const { data: segments = [] } = useQuery({
    queryKey: ['/api/admin/customer-segments'],
  });

  // Campaign analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/campaign-analytics'],
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('/api/admin/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Kampanye berhasil dibuat" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/campaigns'] });
      setCampaignForm({
        name: '',
        type: 'promotion',
        message: '',
        targetSegment: 'all',
        scheduledDate: ''
      });
    },
  });

  // Send broadcast mutation
  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('/api/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Broadcast berhasil dikirim" });
      setSelectedCustomers([]);
    },
  });

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c: Customer) => c.id));
    }
  };

  const getCustomerStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      vip: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCampaignStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const messageTemplates = {
    birthday: "🎉 Selamat ulang tahun! Dapatkan diskon 20% untuk layanan apapun hari ini. Gunakan kode: BIRTHDAY20",
    anniversary: "🎊 Terima kasih telah menjadi pelanggan setia! Nikmati promo spesial untuk Anda.",
    reengagement: "Kami rindu Anda! Kembali dan dapatkan diskon 15% untuk layanan favorit Anda.",
    promotion: "🔥 Promo terbatas! Hemat hingga 30% untuk semua layanan. Buruan booking sekarang!",
    reminder: "Mobil/motor Anda sudah waktunya dicuci? Book layanan sekarang dan dapatkan hasil terbaik!"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM & Communication</h1>
          <p className="text-gray-600">Kelola pelanggan dan kampanye komunikasi</p>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers">Pelanggan</TabsTrigger>
          <TabsTrigger value="campaigns">Kampanye</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={filterSegment} onValueChange={setFilterSegment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter Segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pelanggan</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="new">Pelanggan Baru</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSelectAll} variant="outline">
                {selectedCustomers.length === customers.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </Button>

              {selectedCustomers.length > 0 && (
                <Badge variant="secondary">
                  {selectedCustomers.length} dipilih
                </Badge>
              )}
            </div>

            <Card>
              <CardContent>
                {customersLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="space-y-4">
                    {customers.map((customer: Customer) => (
                      <div
                        key={customer.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedCustomers.includes(customer.id)
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleCustomerSelect(customer.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{customer.name}</h3>
                              <Badge className={getCustomerStatusBadge(customer.status)}>
                                {customer.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {customer.phone}
                              </span>
                              {customer.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {customer.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {customer.totalOrders} order • Rp {customer.totalSpent.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Terakhir: {new Date(customer.lastOrderDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Create Campaign */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Buat Kampanye Baru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaignName">Nama Kampanye</Label>
                  <Input
                    id="campaignName"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Promo Akhir Tahun"
                  />
                </div>

                <div>
                  <Label htmlFor="campaignType">Tipe Kampanye</Label>
                  <Select 
                    value={campaignForm.type} 
                    onValueChange={(value) => {
                      setCampaignForm(prev => ({ 
                        ...prev, 
                        type: value,
                        message: messageTemplates[value as keyof typeof messageTemplates] || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthday">Birthday Greeting</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="reengagement">Re-engagement</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="reminder">Service Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetSegment">Target Segment</Label>
                  <Select 
                    value={campaignForm.targetSegment} 
                    onValueChange={(value) => setCampaignForm(prev => ({ ...prev, targetSegment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pelanggan</SelectItem>
                      <SelectItem value="active">Pelanggan Aktif</SelectItem>
                      <SelectItem value="inactive">Pelanggan Tidak Aktif</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="new">Pelanggan Baru</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea
                    id="message"
                    value={campaignForm.message}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tulis pesan kampanye..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledDate">Jadwal Kirim</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={campaignForm.scheduledDate}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>

                <Button 
                  onClick={() => createCampaignMutation.mutate(campaignForm)}
                  disabled={createCampaignMutation.isPending}
                  className="w-full"
                >
                  {createCampaignMutation.isPending ? 'Membuat...' : 'Buat Kampanye'}
                </Button>
              </CardContent>
            </Card>

            {/* Campaign List */}
            <Card>
              <CardHeader>
                <CardTitle>Kampanye Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign: Campaign) => (
                      <div key={campaign.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{campaign.name}</h3>
                          <Badge className={getCampaignStatusBadge(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{campaign.message}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Target: {campaign.targetSegment}</span>
                          <span>{campaign.sentCount} terkirim</span>
                        </div>
                        {campaign.status === 'completed' && (
                          <div className="mt-2 text-sm text-green-600">
                            Response rate: {campaign.responseRate}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Kirim Broadcast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  {selectedCustomers.length} pelanggan dipilih untuk menerima broadcast
                </p>
              </div>

              <div>
                <Label htmlFor="broadcastMessage">Pesan Broadcast</Label>
                <Textarea
                  id="broadcastMessage"
                  placeholder="Tulis pesan broadcast..."
                  rows={6}
                />
              </div>

              <Button 
                onClick={() => sendBroadcastMutation.mutate({
                  customerIds: selectedCustomers,
                  message: (document.getElementById('broadcastMessage') as HTMLTextAreaElement)?.value
                })}
                disabled={sendBroadcastMutation.isPending || selectedCustomers.length === 0}
              >
                {sendBroadcastMutation.isPending ? 'Mengirim...' : `Kirim ke ${selectedCustomers.length} pelanggan`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Pelanggan</p>
                    <p className="text-2xl font-bold">{analytics?.totalCustomers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Kampanye Aktif</p>
                    <p className="text-2xl font-bold">{analytics?.activeCampaigns || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold">{analytics?.avgResponseRate || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Send className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Pesan Terkirim</p>
                    <p className="text-2xl font-bold">{analytics?.messagesSent || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.filter((c: Campaign) => c.status === 'completed').map((campaign: Campaign) => (
                  <div key={campaign.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-gray-600">{campaign.sentCount} pesan terkirim</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{campaign.responseRate}%</p>
                      <p className="text-sm text-gray-500">response rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}