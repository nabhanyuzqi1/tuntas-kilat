import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';

interface GeolocationTrackerProps {
  orderId?: number;
  isWorker?: boolean;
  customerLocation?: { lat: number; lng: number; address: string };
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export default function GeolocationTracker({ orderId, isWorker = false, customerLocation }: GeolocationTrackerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const watchId = useRef<number | null>(null);

  // Update worker location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (location: LocationData) => {
      return await apiRequest('/api/workers/location', 'PATCH', {
        orderId,
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
      });
    },
    onError: (error) => {
      console.error('Failed to update location:', error);
    },
  });

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Estimate travel time (assuming average speed of 30 km/h in urban areas)
  const calculateEstimatedTime = (distanceKm: number): number => {
    const averageSpeed = 30; // km/h
    return Math.round((distanceKm / averageSpeed) * 60); // minutes
  };

  // Start location tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000, // 30 seconds
    };

    const successCallback = (position: GeolocationPosition) => {
      const locationData: LocationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now(),
      };

      setCurrentLocation(locationData);

      // Calculate distance to customer if available
      if (customerLocation) {
        const dist = calculateDistance(
          locationData.lat,
          locationData.lng,
          customerLocation.lat,
          customerLocation.lng
        );
        setDistance(dist);
        setEstimatedTime(calculateEstimatedTime(dist));
      }

      // Update worker location if this is a worker
      if (isWorker && orderId) {
        updateLocationMutation.mutate(locationData);
      }
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let message = "Unknown error occurred";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "Location access denied. Please enable location permissions.";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "Location information unavailable.";
          break;
        case error.TIMEOUT:
          message = "Location request timed out.";
          break;
      }
      
      toast({
        title: "Location Error",
        description: message,
        variant: "destructive",
      });
      setIsTracking(false);
    };

    watchId.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );

    setIsTracking(true);
  };

  // Stop location tracking
  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  // Get current location once
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        setCurrentLocation(locationData);
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Failed to get current location",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Open navigation app
  const openNavigation = () => {
    if (!customerLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}`;
    window.open(url, '_blank');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  // Auto-start tracking for workers with orders
  useEffect(() => {
    if (isWorker && orderId && !isTracking) {
      startTracking();
    }
  }, [isWorker, orderId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>{isWorker ? 'Tracking Lokasi' : 'Status Lokasi Worker'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location */}
        {currentLocation && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Lokasi Saat Ini</p>
              <p className="text-xs text-gray-600">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
              <p className="text-xs text-gray-500">
                Akurasi: {Math.round(currentLocation.accuracy)}m
              </p>
            </div>
            <Badge variant={currentLocation.accuracy < 50 ? "default" : "secondary"}>
              {currentLocation.accuracy < 50 ? "Akurat" : "Perkiraan"}
            </Badge>
          </div>
        )}

        {/* Distance and ETA */}
        {distance !== null && estimatedTime !== null && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-600">
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </p>
              <p className="text-xs text-gray-600">Jarak</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">
                {estimatedTime < 60 ? `${estimatedTime}m` : `${Math.round(estimatedTime / 60)}j ${estimatedTime % 60}m`}
              </p>
              <p className="text-xs text-gray-600">Estimasi</p>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex space-x-2">
          {!isTracking ? (
            <Button onClick={startTracking} className="flex-1">
              <MapPin className="w-4 h-4 mr-2" />
              Mulai Tracking
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="outline" className="flex-1">
              <AlertCircle className="w-4 h-4 mr-2" />
              Stop Tracking
            </Button>
          )}
          
          {!currentLocation && (
            <Button onClick={getCurrentLocation} variant="outline">
              <Navigation className="w-4 h-4" />
            </Button>
          )}
          
          {customerLocation && (
            <Button onClick={openNavigation} variant="outline">
              <Navigation className="w-4 h-4 mr-2" />
              Navigasi
            </Button>
          )}
        </div>

        {/* Tracking Status */}
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-gray-600">
            {isTracking ? 'Tracking aktif' : 'Tracking tidak aktif'}
          </span>
          {isTracking && (
            <Clock className="w-4 h-4 text-gray-400 ml-auto" />
          )}
        </div>

        {/* Location Permission Notice */}
        {!currentLocation && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Izin Lokasi Diperlukan</p>
                <p className="text-yellow-700">
                  Untuk tracking yang akurat, mohon izinkan akses lokasi di browser Anda.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}