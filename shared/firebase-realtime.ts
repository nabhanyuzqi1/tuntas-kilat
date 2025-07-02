import { realtimeDb } from "./firebase-config";
import { ref, push, onValue, off, set, remove, update, child, get } from "firebase/database";

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderType: 'customer' | 'worker' | 'admin' | 'bot';
  content: string;
  timestamp: number;
  messageType: 'text' | 'image' | 'location' | 'order_update';
  metadata?: {
    orderId?: string;
    location?: { lat: number; lng: number };
    imageUrl?: string;
  };
}

export interface WorkerLocation {
  workerId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
  status: 'available' | 'busy' | 'offline';
}

export interface OrderTracking {
  orderId: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'ontheway' | 'arrived' | 'inprogress' | 'completed' | 'cancelled';
  workerId?: string;
  currentLocation?: { lat: number; lng: number };
  estimatedArrival?: number;
  timestamp: number;
  notes?: string;
}

export interface HeatmapData {
  area: string;
  lat: number;
  lng: number;
  orderCount: number;
  revenue: number;
  lastUpdated: number;
}

export class FirebaseRealtimeService {
  
  // ===== CHAT SYSTEM USING REALTIME DATABASE =====
  
  /**
   * Send chat message to realtime database
   */
  async sendChatMessage(conversationId: string, message: ChatMessage): Promise<string | null> {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return null;
    }

    try {
      const messagesRef = ref(realtimeDb, `chats/${conversationId}/messages`);
      const messageData = {
        ...message,
        timestamp: Date.now()
      };
      
      const newMessageRef = await push(messagesRef, messageData);
      
      // Update conversation metadata
      await update(ref(realtimeDb, `chats/${conversationId}`), {
        lastMessage: message.content,
        lastMessageAt: messageData.timestamp,
        lastSenderId: message.senderId
      });
      
      return newMessageRef.key;
    } catch (error) {
      console.error('Error sending chat message:', error);
      return null;
    }
  }

  /**
   * Listen to chat messages in real-time
   */
  subscribeToChatMessages(
    conversationId: string, 
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return () => {};
    }

    const messagesRef = ref(realtimeDb, `chats/${conversationId}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages: ChatMessage[] = Object.entries(data).map(([id, msg]: [string, any]) => ({
          id,
          ...msg
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        callback(messages);
      } else {
        callback([]);
      }
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }

  /**
   * Send bot response to chat
   */
  async sendBotMessage(conversationId: string, content: string, quickReplies?: string[]): Promise<void> {
    const botMessage: ChatMessage = {
      senderId: 'bot',
      senderType: 'bot',
      content,
      timestamp: Date.now(),
      messageType: 'text',
      metadata: quickReplies ? { quickReplies } : undefined
    };

    await this.sendChatMessage(conversationId, botMessage);
  }

  // ===== WORKER LOCATION TRACKING =====
  
  /**
   * Update worker location in real-time
   */
  async updateWorkerLocation(location: WorkerLocation): Promise<void> {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return;
    }

    try {
      const locationRef = ref(realtimeDb, `worker_locations/${location.workerId}`);
      await set(locationRef, {
        ...location,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error updating worker location:', error);
    }
  }

  /**
   * Subscribe to worker location updates
   */
  subscribeToWorkerLocation(
    workerId: string,
    callback: (location: WorkerLocation | null) => void
  ): () => void {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return () => {};
    }

    const locationRef = ref(realtimeDb, `worker_locations/${workerId}`);
    
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const location = snapshot.val();
      callback(location);
    });

    return () => off(locationRef, 'value', unsubscribe);
  }

  /**
   * Get all active worker locations
   */
  subscribeToAllWorkerLocations(
    callback: (locations: { [workerId: string]: WorkerLocation }) => void
  ): () => void {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return () => {};
    }

    const locationsRef = ref(realtimeDb, 'worker_locations');
    
    const unsubscribe = onValue(locationsRef, (snapshot) => {
      const locations = snapshot.val() || {};
      // Filter locations updated within last 10 minutes
      const activeLocations: { [workerId: string]: WorkerLocation } = {};
      const cutoffTime = Date.now() - (10 * 60 * 1000);
      
      Object.entries(locations).forEach(([workerId, location]: [string, any]) => {
        if (location.timestamp > cutoffTime) {
          activeLocations[workerId] = location;
        }
      });
      
      callback(activeLocations);
    });

    return () => off(locationsRef, 'value', unsubscribe);
  }

  // ===== ORDER TRACKING =====
  
  /**
   * Update order tracking status
   */
  async updateOrderTracking(tracking: OrderTracking): Promise<void> {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return;
    }

    try {
      const trackingRef = ref(realtimeDb, `order_tracking/${tracking.orderId}`);
      await set(trackingRef, {
        ...tracking,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error updating order tracking:', error);
    }
  }

  /**
   * Subscribe to order tracking updates
   */
  subscribeToOrderTracking(
    orderId: string,
    callback: (tracking: OrderTracking | null) => void
  ): () => void {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return () => {};
    }

    const trackingRef = ref(realtimeDb, `order_tracking/${orderId}`);
    
    const unsubscribe = onValue(trackingRef, (snapshot) => {
      const tracking = snapshot.val();
      callback(tracking);
    });

    return () => off(trackingRef, 'value', unsubscribe);
  }

  // ===== HEATMAP DATA =====
  
  /**
   * Update heatmap data for analytics
   */
  async updateHeatmapData(data: HeatmapData): Promise<void> {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return;
    }

    try {
      const heatmapRef = ref(realtimeDb, `heatmap/${data.area}`);
      await set(heatmapRef, {
        ...data,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error updating heatmap data:', error);
    }
  }

  /**
   * Subscribe to heatmap data for real-time analytics
   */
  subscribeToHeatmapData(
    callback: (heatmapData: { [area: string]: HeatmapData }) => void
  ): () => void {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return () => {};
    }

    const heatmapRef = ref(realtimeDb, 'heatmap');
    
    const unsubscribe = onValue(heatmapRef, (snapshot) => {
      const data = snapshot.val() || {};
      callback(data);
    });

    return () => off(heatmapRef, 'value', unsubscribe);
  }

  // ===== NOTIFICATIONS =====
  
  /**
   * Send real-time notification
   */
  async sendNotification(userId: string, notification: {
    title: string;
    message: string;
    type: 'order_update' | 'assignment' | 'message' | 'system';
    data?: any;
  }): Promise<void> {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return;
    }

    try {
      const notificationRef = ref(realtimeDb, `notifications/${userId}`);
      await push(notificationRef, {
        ...notification,
        timestamp: Date.now(),
        read: false
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Subscribe to user notifications
   */
  subscribeToNotifications(
    userId: string,
    callback: (notifications: any[]) => void
  ): () => void {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return () => {};
    }

    const notificationsRef = ref(realtimeDb, `notifications/${userId}`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notifications = Object.entries(data).map(([id, notif]: [string, any]) => ({
          id,
          ...notif
        })).sort((a, b) => b.timestamp - a.timestamp);
        
        callback(notifications);
      } else {
        callback([]);
      }
    });

    return () => off(notificationsRef, 'value', unsubscribe);
  }

  // ===== OTP MANAGEMENT =====
  
  /**
   * Store OTP in Firebase Realtime Database with expiration
   */
  async storeOTP(phoneNumber: string, otp: string, expiryMinutes: number = 5): Promise<void> {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return;
    }

    try {
      const otpRef = ref(realtimeDb, `otp/${phoneNumber.replace(/\+/g, '')}`);
      const expiresAt = Date.now() + (expiryMinutes * 60 * 1000);
      
      await set(otpRef, {
        otp,
        expiresAt,
        attempts: 0,
        createdAt: Date.now()
      });

      // Auto-delete after expiry
      setTimeout(async () => {
        await remove(otpRef);
      }, expiryMinutes * 60 * 1000);

    } catch (error) {
      console.error('Error storing OTP:', error);
    }
  }

  /**
   * Verify OTP from Firebase Realtime Database
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<{ 
    valid: boolean; 
    message: string; 
    attemptsLeft?: number; 
  }> {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available');
      return { valid: false, message: 'Database not available' };
    }

    try {
      const otpRef = ref(realtimeDb, `otp/${phoneNumber.replace(/\+/g, '')}`);
      const snapshot = await get(otpRef);
      
      if (!snapshot.exists()) {
        return { valid: false, message: 'Kode OTP tidak ditemukan atau sudah kedaluwarsa' };
      }

      const otpData = snapshot.val();
      const now = Date.now();

      if (now > otpData.expiresAt) {
        await remove(otpRef);
        return { valid: false, message: 'Kode OTP sudah kedaluwarsa' };
      }

      if (otpData.attempts >= 3) {
        await remove(otpRef);
        return { valid: false, message: 'Terlalu banyak percobaan. Silakan minta kode baru' };
      }

      if (otpData.otp !== otp) {
        await update(otpRef, { attempts: otpData.attempts + 1 });
        const attemptsLeft = 3 - (otpData.attempts + 1);
        return { 
          valid: false, 
          message: `Kode OTP salah. Sisa percobaan: ${attemptsLeft}`,
          attemptsLeft 
        };
      }

      // OTP valid, remove it
      await remove(otpRef);
      return { valid: true, message: 'Kode OTP valid' };

    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { valid: false, message: 'Terjadi kesalahan sistem' };
    }
  }

  // ===== CLEANUP METHODS =====
  
  /**
   * Clean up expired data
   */
  async cleanupExpiredData(): Promise<void> {
    if (!realtimeDb) return;

    try {
      const now = Date.now();
      const expiredCutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago

      // Clean expired worker locations
      const locationsSnapshot = await get(ref(realtimeDb, 'worker_locations'));
      if (locationsSnapshot.exists()) {
        const locations = locationsSnapshot.val();
        const updates: { [path: string]: any } = {};
        
        Object.entries(locations).forEach(([workerId, location]: [string, any]) => {
          if (location.timestamp < expiredCutoff) {
            updates[`worker_locations/${workerId}`] = null;
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(ref(realtimeDb), updates);
        }
      }

    } catch (error) {
      console.error('Error cleaning up expired data:', error);
    }
  }
}

export const firebaseRealtime = new FirebaseRealtimeService();