import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/lib/websocket';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export default function PushNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const notificationRef = useRef<Notification | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // WebSocket message handler for real-time notifications
  useWebSocket((message) => {
    if (!user) return;

    switch (message.type) {
      case 'order_status_update':
        handleOrderStatusUpdate(message.data);
        break;
      case 'new_order_assignment':
        if (user.role === 'worker') {
          handleNewOrderAssignment(message.data);
        }
        break;
      case 'worker_location_update':
        if (user.role === 'customer') {
          handleWorkerLocationUpdate(message.data);
        }
        break;
      case 'order_completed':
        handleOrderCompleted(message.data);
        break;
      case 'payment_confirmation':
        handlePaymentConfirmation(message.data);
        break;
      default:
        break;
    }
  });

  const showNotification = (title: string, body: string, icon?: string) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      notificationRef.current = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: 'tuntas-kilat',
        requireInteraction: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notificationRef.current?.close();
      }, 5000);
    }

    // Toast notification
    toast({
      title,
      description: body,
      duration: 5000,
    });
  };

  const handleOrderStatusUpdate = (data: any) => {
    const statusMessages = {
      confirmed: 'Pesanan Anda telah dikonfirmasi',
      assigned: 'Worker telah ditugaskan untuk pesanan Anda',
      accepted: 'Worker telah menerima pesanan Anda',
      ontheway: 'Worker sedang dalam perjalanan',
      arrived: 'Worker telah tiba di lokasi',
      inprogress: 'Layanan sedang berlangsung',
      completed: 'Pesanan telah selesai',
      cancelled: 'Pesanan dibatalkan'
    };

    const status = data.status as keyof typeof statusMessages;
    const message = statusMessages[status] || 'Status pesanan diperbarui';
    
    showNotification(
      'Update Pesanan',
      `${message} - #${data.trackingId}`
    );

    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    queryClient.invalidateQueries({ queryKey: ['/api/orders', data.trackingId] });
  };

  const handleNewOrderAssignment = (data: any) => {
    showNotification(
      'Pesanan Baru!',
      `Anda mendapat pesanan ${data.serviceName} - #${data.trackingId}`
    );

    // Invalidate worker queries
    queryClient.invalidateQueries({ queryKey: ['/api/workers/orders'] });
  };

  const handleWorkerLocationUpdate = (data: any) => {
    if (data.isNearby) {
      showNotification(
        'Worker Hampir Tiba',
        `${data.workerName} sedang menuju lokasi Anda`
      );
    }
  };

  const handleOrderCompleted = (data: any) => {
    showNotification(
      'Pesanan Selesai',
      `Terima kasih! Pesanan #${data.trackingId} telah selesai`
    );

    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  };

  const handlePaymentConfirmation = (data: any) => {
    showNotification(
      'Pembayaran Berhasil',
      `Pembayaran untuk pesanan #${data.trackingId} telah dikonfirmasi`
    );
  };

  return null; // This component doesn't render anything
}

// Utility function to send notifications to specific users
export const sendNotificationToUser = async (userId: string, notification: {
  title: string;
  body: string;
  type: string;
  data?: any;
}) => {
  try {
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        notification,
      }),
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};