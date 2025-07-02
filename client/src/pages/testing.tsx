import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GeolocationTracker from "@/components/tracking/geolocation-tracker";
import { 
  Play, 
  TestTube, 
  Zap, 
  Users, 
  MapPin, 
  Bell,
  Bot,
  Database,
  Clock,
  CheckCircle
} from "lucide-react";

export default function Testing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testResults, setTestResults] = useState<any>({});

  // Test data queries
  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    retry: false,
  });

  const { data: workers } = useQuery({
    queryKey: ["/api/workers"],
    retry: false,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    retry: false,
  });

  // Test mutations
  const createTestOrderMutation = useMutation({
    mutationFn: async (testData: any) => {
      return await apiRequest('/api/orders', 'POST', testData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setTestResults(prev => ({ ...prev, orderCreation: { success: true, data } }));
      toast({
        title: "Test Berhasil",
        description: `Order test berhasil dibuat: ${data.trackingId}`,
      });
    },
    onError: (error) => {
      setTestResults(prev => ({ ...prev, orderCreation: { success: false, error: error.message } }));
      toast({
        title: "Test Gagal",
        description: "Order creation test failed",
        variant: "destructive",
      });
    },
  });

  const autoAssignMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiRequest(`/api/orders/${orderId}/auto-assign`, 'POST', { urgency: 'medium' });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ ...prev, autoAssignment: { success: true, data } }));
      toast({
        title: "Auto-Assignment Berhasil",
        description: data.success ? "Worker berhasil di-assign" : "Tidak ada worker yang cocok",
      });
    },
    onError: (error) => {
      setTestResults(prev => ({ ...prev, autoAssignment: { success: false, error: error.message } }));
    },
  });

  const chatbotTestMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/chatbot/message', 'POST', { message });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ ...prev, chatbot: { success: true, data } }));
      toast({
        title: "Chatbot Test Berhasil",
        description: "AI response received",
      });
    },
    onError: (error) => {
      setTestResults(prev => ({ ...prev, chatbot: { success: false, error: error.message } }));
    },
  });

  const notificationTestMutation = useMutation({
    mutationFn: async () => {
      // Send a test notification via WebSocket
      return await apiRequest('/api/test/notification', 'POST', {
        type: 'test_notification',
        message: 'This is a test notification'
      });
    },
    onSuccess: () => {
      setTestResults(prev => ({ ...prev, notifications: { success: true } }));
      toast({
        title: "Notifikasi Test",
        description: "Test notification sent",
      });
    },
    onError: (error) => {
      setTestResults(prev => ({ ...prev, notifications: { success: false, error: error.message } }));
    },
  });

  // Test functions
  const runOrderCreationTest = () => {
    const testOrder = {
      serviceId: services?.[0]?.id || 1,
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      customerInfo: {
        name: "Test Customer",
        phone: "+6281234567890",
        email: "test@example.com",
        address: "Jl. Testing No. 123, Jakarta",
        location: {
          lat: -6.2088,
          lng: 106.8456,
          address: "Jakarta Pusat"
        }
      },
      promoCode: "NEWUSER",
      notes: "Test order dari testing interface"
    };

    createTestOrderMutation.mutate(testOrder);
  };

  const runAutoAssignmentTest = () => {
    const pendingOrder = orders?.find((order: any) => order.status === 'confirmed' && !order.workerId);
    if (pendingOrder) {
      autoAssignMutation.mutate(pendingOrder.id);
    } else {
      toast({
        title: "No Pending Orders",
        description: "Tidak ada order yang pending untuk di-test",
        variant: "destructive",
      });
    }
  };

  const runChatbotTest = () => {
    const testMessages = [
      "Halo, saya ingin pesan cuci mobil",
      "Berapa harga cuci motor?",
      "Bagaimana cara booking?",
      "Status pesanan saya bagaimana?"
    ];
    
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    chatbotTestMutation.mutate(randomMessage);
  };

  const runFullSystemTest = async () => {
    toast({
      title: "Starting Full System Test",
      description: "Testing semua komponen sistem...",
    });

    // Reset test results
    setTestResults({});

    // Run tests sequentially
    setTimeout(() => runOrderCreationTest(), 500);
    setTimeout(() => runChatbotTest(), 1500);
    setTimeout(() => runAutoAssignmentTest(), 2500);
    setTimeout(() => notificationTestMutation.mutate(), 3500);
  };

  const getTestResultBadge = (testName: string) => {
    const result = testResults[testName];
    if (!result) return <Badge variant="secondary">Not Run</Badge>;
    return result.success 
      ? <Badge variant="default" className="bg-green-500">Passed</Badge>
      : <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div className="min-h-screen bg-stone">
      <Navbar />
      
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <TestTube className="w-8 h-8 text-primary" />
                <span>Testing Interface</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive testing platform untuk semua fitur Tuntas Kilat
              </p>
            </div>
            <Button onClick={runFullSystemTest} size="lg" className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Run Full Test</span>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{services?.length || 0}</p>
                  <p className="text-sm text-gray-600">Services</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{workers?.length || 0}</p>
                  <p className="text-sm text-gray-600">Workers</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{orders?.length || 0}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {orders?.filter((o: any) => o.status === 'confirmed').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Order Creation</span>
                {getTestResultBadge('orderCreation')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto Assignment</span>
                {getTestResultBadge('autoAssignment')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chatbot AI</span>
                {getTestResultBadge('chatbot')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications</span>
                {getTestResultBadge('notifications')}
              </div>
            </CardContent>
          </Card>

          {/* Individual Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Individual Tests</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={runOrderCreationTest} 
                variant="outline" 
                className="w-full justify-start"
                disabled={createTestOrderMutation.isPending}
              >
                <Bot className="w-4 h-4 mr-2" />
                Test Order Creation
              </Button>
              
              <Button 
                onClick={runAutoAssignmentTest} 
                variant="outline" 
                className="w-full justify-start"
                disabled={autoAssignMutation.isPending}
              >
                <Users className="w-4 h-4 mr-2" />
                Test Auto Assignment
              </Button>
              
              <Button 
                onClick={runChatbotTest} 
                variant="outline" 
                className="w-full justify-start"
                disabled={chatbotTestMutation.isPending}
              >
                <Bot className="w-4 h-4 mr-2" />
                Test AI Chatbot
              </Button>
              
              <Button 
                onClick={() => notificationTestMutation.mutate()} 
                variant="outline" 
                className="w-full justify-start"
                disabled={notificationTestMutation.isPending}
              >
                <Bell className="w-4 h-4 mr-2" />
                Test Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Geolocation Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Geolocation Test</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GeolocationTracker 
                isWorker={true}
                customerLocation={{
                  lat: -6.2088,
                  lng: 106.8456,
                  address: "Jakarta Pusat (Test Location)"
                }}
              />
            </CardContent>
          </Card>

          {/* Test Data Display */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Test Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}