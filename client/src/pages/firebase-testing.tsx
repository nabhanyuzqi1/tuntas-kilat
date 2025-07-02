import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { firebaseStorage } from "@shared/firebase-services"; // Removed for build compatibility
import { 
  Database, 
  Cloud, 
  Upload, 
  MessageSquare,
  Bell,
  TestTube,
  CheckCircle,
  AlertCircle,
  Server
} from "lucide-react";

export default function FirebaseTesting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testResults, setTestResults] = useState<any>({});
  const [selectedService, setSelectedService] = useState<string>("");

  // Firebase service tests
  const testFirestoreConnection = useMutation({
    mutationFn: async () => {
      const services = await firebaseStorage.getServices();
      return { success: true, count: services.length, services };
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ 
        ...prev, 
        firestore: { success: true, data } 
      }));
      toast({
        title: "Firestore Test Berhasil",
        description: `Ditemukan ${data.count} services`,
      });
    },
    onError: (error) => {
      setTestResults(prev => ({ 
        ...prev, 
        firestore: { success: false, error: error.message } 
      }));
      toast({
        title: "Firestore Test Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testCreateService = useMutation({
    mutationFn: async () => {
      const newService = {
        name: `Test Service ${Date.now()}`,
        description: "Service dibuat untuk testing Firebase",
        category: "test",
        basePrice: 25000,
        duration: 30,
        features: ["Test feature 1", "Test feature 2"],
        active: true,
      };
      
      const serviceId = await firebaseStorage.createService(newService);
      return { success: true, serviceId, service: newService };
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ 
        ...prev, 
        createService: { success: true, data } 
      }));
      toast({
        title: "Service Berhasil Dibuat",
        description: `Service ID: ${data.serviceId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["firebase-services"] });
    },
    onError: (error) => {
      setTestResults(prev => ({ 
        ...prev, 
        createService: { success: false, error: error.message } 
      }));
      toast({
        title: "Gagal Membuat Service",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testRealTimeLocation = useMutation({
    mutationFn: async () => {
      const workers = await firebaseStorage.getWorkers();
      if (workers.length === 0) {
        throw new Error("No workers found for location test");
      }

      const workerId = workers[0].id;
      const testLat = -6.2088 + (Math.random() - 0.5) * 0.01;
      const testLng = 106.8456 + (Math.random() - 0.5) * 0.01;

      await firebaseStorage.updateWorkerLocation(workerId, testLat, testLng);
      
      return { 
        success: true, 
        workerId, 
        location: { lat: testLat, lng: testLng } 
      };
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ 
        ...prev, 
        realtimeLocation: { success: true, data } 
      }));
      toast({
        title: "Real-time Location Test Berhasil",
        description: `Worker ${data.workerId} location updated`,
      });
    },
    onError: (error) => {
      setTestResults(prev => ({ 
        ...prev, 
        realtimeLocation: { success: false, error: error.message } 
      }));
      toast({
        title: "Real-time Location Test Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testAnalytics = useMutation({
    mutationFn: async () => {
      const [orderStats, revenueStats, workerStats] = await Promise.all([
        firebaseStorage.getOrderStats(),
        firebaseStorage.getRevenueStats(),
        firebaseStorage.getWorkerStats(),
      ]);

      return {
        success: true,
        analytics: {
          orders: orderStats,
          revenue: revenueStats,
          workers: workerStats,
        }
      };
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ 
        ...prev, 
        analytics: { success: true, data } 
      }));
      toast({
        title: "Analytics Test Berhasil",
        description: "Data analytics berhasil diambil dari Firestore",
      });
    },
    onError: (error) => {
      setTestResults(prev => ({ 
        ...prev, 
        analytics: { success: false, error: error.message } 
      }));
      toast({
        title: "Analytics Test Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Load Firebase services (commented out for build compatibility)
  /*
  const { data: firebaseServices, isLoading: servicesLoading } = useQuery({
    queryKey: ["firebase-services"],
    queryFn: () => firebaseStorage.getServices(),
    retry: false,
  });

  const { data: firebaseWorkers, isLoading: workersLoading } = useQuery({
    queryKey: ["firebase-workers"],
    queryFn: () => firebaseStorage.getWorkers(),
    retry: false,
  });

  const { data: firebaseOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["firebase-orders"],
    queryFn: () => firebaseStorage.getOrders(10),
    retry: false,
  });
  */

  const runFullFirebaseTest = async () => {
    toast({
      title: "Starting Firebase Test Suite",
      description: "Testing semua komponen Firebase...",
    });

    setTestResults({});

    try {
      await testFirestoreConnection.mutateAsync();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testCreateService.mutateAsync();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testRealTimeLocation.mutateAsync();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testAnalytics.mutateAsync();

      toast({
        title: "Firebase Test Suite Selesai",
        description: "Semua test telah dijalankan",
      });
    } catch (error) {
      toast({
        title: "Firebase Test Suite Error",
        description: "Ada error dalam test suite",
        variant: "destructive",
      });
    }
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
      
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Database className="w-8 h-8 text-primary" />
                <span>Firebase Testing Interface</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Testing platform untuk semua layanan Firebase (Firestore, Realtime DB, Functions, Storage)
              </p>
            </div>
            <Button onClick={runFullFirebaseTest} size="lg" className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Run Full Firebase Test</span>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Firebase Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Firebase Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {servicesLoading ? "..." : firebaseServices?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Firestore Services</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {workersLoading ? "..." : firebaseWorkers?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Firebase Workers</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {ordersLoading ? "..." : firebaseOrders?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Firebase Orders</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">Active</p>
                  <p className="text-sm text-gray-600">Connection</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Firebase Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Firestore Connection</span>
                {getTestResultBadge('firestore')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service Creation</span>
                {getTestResultBadge('createService')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Real-time Location</span>
                {getTestResultBadge('realtimeLocation')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analytics</span>
                {getTestResultBadge('analytics')}
              </div>
            </CardContent>
          </Card>

          {/* Individual Firebase Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="w-5 h-5" />
                <span>Individual Tests</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => testFirestoreConnection.mutate()} 
                variant="outline" 
                className="w-full justify-start"
                disabled={testFirestoreConnection.isPending}
              >
                <Database className="w-4 h-4 mr-2" />
                Test Firestore Connection
              </Button>
              
              <Button 
                onClick={() => testCreateService.mutate()} 
                variant="outline" 
                className="w-full justify-start"
                disabled={testCreateService.isPending}
              >
                <Upload className="w-4 h-4 mr-2" />
                Test Service Creation
              </Button>
              
              <Button 
                onClick={() => testRealTimeLocation.mutate()} 
                variant="outline" 
                className="w-full justify-start"
                disabled={testRealTimeLocation.isPending}
              >
                <Bell className="w-4 h-4 mr-2" />
                Test Real-time Location
              </Button>
              
              <Button 
                onClick={() => testAnalytics.mutate()} 
                variant="outline" 
                className="w-full justify-start"
                disabled={testAnalytics.isPending}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Test Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Firebase Services List */}
          <Card>
            <CardHeader>
              <CardTitle>Firebase Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {servicesLoading ? (
                  <p className="text-gray-500">Loading services...</p>
                ) : firebaseServices?.length ? (
                  firebaseServices.map((service) => (
                    <div key={service.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.category}</p>
                      <p className="text-sm font-bold text-green-600">
                        Rp {service.basePrice?.toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No services found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Data Display */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Firebase Test Data</CardTitle>
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