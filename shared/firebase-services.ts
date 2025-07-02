import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  GeoPoint,
  Timestamp,
} from "firebase/firestore";
import { ref, push, set, onValue, off } from "firebase/database";
import { db, realtimeDb } from "./firebase-config";

// Types for Firebase documents
export interface FirebaseUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseService {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number;
  features: string[];
  active: boolean;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseWorker {
  id: string;
  userId: string;
  employeeId: string;
  name: string;
  phone: string;
  email?: string;
  specializations: string[];
  availability: 'available' | 'busy' | 'offline' | 'on_leave';
  location?: GeoPoint;
  locationAccuracy?: number;
  lastLocationUpdate?: Timestamp;
  averageRating: number;
  totalJobs: number;
  joinDate: Timestamp;
  profileImageUrl?: string;
  emergencyContact: string;
  equipment: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseOrder {
  id: string;
  trackingId: string;
  customerId: string;
  workerId?: string;
  serviceId: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime: Timestamp;
  estimatedDuration: number;
  basePrice: number;
  finalAmount: number;
  promoCode?: string;
  discount?: number;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
  };
  notes?: string;
  timeline: Array<{
    status: string;
    timestamp: Timestamp;
    note?: string;
  }>;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  rating?: number;
  review?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  assignedAt?: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  cancelledAt?: Timestamp;
}

export interface FirebaseConversation {
  id: string;
  customerId: string;
  messages: Array<{
    id: string;
    sender: 'customer' | 'ai' | 'support';
    content: string;
    timestamp: Timestamp;
    quickReplies?: string[];
    bookingAction?: {
      type: 'view_services' | 'start_booking' | 'check_order';
      data?: any;
    };
  }>;
  status: 'active' | 'resolved' | 'escalated';
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firebase Service Class
export class FirebaseStorageService {
  // User operations
  async getUser(userId: string): Promise<FirebaseUser | null> {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? ({ id: userDoc.id, ...userDoc.data() } as FirebaseUser) : null;
  }

  async createUser(userData: Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateUser(userId: string, userData: Partial<FirebaseUser>): Promise<void> {
    await updateDoc(doc(db, "users", userId), {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  }

  // Service operations
  async getServices(): Promise<FirebaseService[]> {
    const servicesQuery = query(
      collection(db, "services"),
      where("active", "==", true),
      orderBy("name")
    );
    const snapshot = await getDocs(servicesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseService));
  }

  async getService(serviceId: string): Promise<FirebaseService | null> {
    const serviceDoc = await getDoc(doc(db, "services", serviceId));
    return serviceDoc.exists() ? ({ id: serviceDoc.id, ...serviceDoc.data() } as FirebaseService) : null;
  }

  async createService(serviceData: Omit<FirebaseService, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, "services"), {
      ...serviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  // Worker operations
  async getWorkers(): Promise<FirebaseWorker[]> {
    const workersQuery = query(collection(db, "workers"), orderBy("name"));
    const snapshot = await getDocs(workersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseWorker));
  }

  async getWorker(workerId: string): Promise<FirebaseWorker | null> {
    const workerDoc = await getDoc(doc(db, "workers", workerId));
    return workerDoc.exists() ? ({ id: workerDoc.id, ...workerDoc.data() } as FirebaseWorker) : null;
  }

  async getWorkerByUserId(userId: string): Promise<FirebaseWorker | null> {
    const workersQuery = query(collection(db, "workers"), where("userId", "==", userId));
    const snapshot = await getDocs(workersQuery);
    return snapshot.empty ? null : ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FirebaseWorker);
  }

  async getAvailableWorkers(specialization?: string): Promise<FirebaseWorker[]> {
    let workersQuery = query(
      collection(db, "workers"),
      where("availability", "==", "available")
    );

    if (specialization) {
      workersQuery = query(workersQuery, where("specializations", "array-contains", specialization));
    }

    const snapshot = await getDocs(workersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseWorker));
  }

  async updateWorkerLocation(workerId: string, lat: number, lng: number): Promise<void> {
    await updateDoc(doc(db, "workers", workerId), {
      location: new GeoPoint(lat, lng),
      lastLocationUpdate: serverTimestamp(),
    });

    // Also update real-time location
    await set(ref(realtimeDb, `workers/${workerId}/location`), {
      lat,
      lng,
      timestamp: Date.now(),
    });
  }

  // Order operations
  async getOrders(limitCount = 50): Promise<FirebaseOrder[]> {
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseOrder));
  }

  async getOrder(orderId: string): Promise<FirebaseOrder | null> {
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    return orderDoc.exists() ? ({ id: orderDoc.id, ...orderDoc.data() } as FirebaseOrder) : null;
  }

  async getOrderByTrackingId(trackingId: string): Promise<FirebaseOrder | null> {
    const ordersQuery = query(collection(db, "orders"), where("trackingId", "==", trackingId));
    const snapshot = await getDocs(ordersQuery);
    return snapshot.empty ? null : ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FirebaseOrder);
  }

  async getOrdersByCustomer(customerId: string): Promise<FirebaseOrder[]> {
    const ordersQuery = query(
      collection(db, "orders"),
      where("customerId", "==", customerId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseOrder));
  }

  async getOrdersByWorker(workerId: string): Promise<FirebaseOrder[]> {
    const ordersQuery = query(
      collection(db, "orders"),
      where("workerId", "==", workerId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseOrder));
  }

  async createOrder(orderData: Omit<FirebaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateOrder(orderId: string, orderData: Partial<FirebaseOrder>): Promise<void> {
    await updateDoc(doc(db, "orders", orderId), {
      ...orderData,
      updatedAt: serverTimestamp(),
    });
  }

  // Conversation operations
  async getConversation(conversationId: string): Promise<FirebaseConversation | null> {
    const conversationDoc = await getDoc(doc(db, "conversations", conversationId));
    return conversationDoc.exists() ? ({ id: conversationDoc.id, ...conversationDoc.data() } as FirebaseConversation) : null;
  }

  async getConversationByCustomer(customerId: string): Promise<FirebaseConversation[]> {
    const conversationsQuery = query(
      collection(db, "conversations"),
      where("customerId", "==", customerId),
      orderBy("lastMessageAt", "desc")
    );
    const snapshot = await getDocs(conversationsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseConversation));
  }

  async createConversation(conversationData: Omit<FirebaseConversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, "conversations"), {
      ...conversationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  // Real-time subscriptions
  subscribeToOrder(orderId: string, callback: (order: FirebaseOrder | null) => void): () => void {
    return onSnapshot(doc(db, "orders", orderId), (doc) => {
      callback(doc.exists() ? ({ id: doc.id, ...doc.data() } as FirebaseOrder) : null);
    });
  }

  subscribeToWorkerLocation(workerId: string, callback: (location: any) => void): () => void {
    const locationRef = ref(realtimeDb, `workers/${workerId}/location`);
    
    onValue(locationRef, (snapshot) => {
      callback(snapshot.val());
    });

    return () => off(locationRef);
  }

  subscribeToNotifications(userId: string, callback: (notifications: any[]) => void): () => void {
    const notificationsRef = ref(realtimeDb, `notifications/${userId}`);
    
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      const notifications = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      callback(notifications);
    });

    return () => off(notificationsRef);
  }

  // Analytics operations
  async getOrderStats(): Promise<any> {
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: orders.length,
      today: orders.filter(o => o.createdAt?.toDate() >= today).length,
      thisWeek: orders.filter(o => o.createdAt?.toDate() >= thisWeek).length,
      thisMonth: orders.filter(o => o.createdAt?.toDate() >= thisMonth).length,
      completed: orders.filter(o => o.status === 'completed').length,
      pending: orders.filter(o => o.status === 'pending').length,
    };
  }

  async getRevenueStats(): Promise<any> {
    const ordersQuery = query(collection(db, "orders"), where("status", "==", "completed"));
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.finalAmount || 0), 0);
    const averageOrderValue = totalRevenue / (orders.length || 1);

    return {
      totalRevenue,
      averageOrderValue,
      totalOrders: orders.length,
    };
  }

  async getWorkerStats(): Promise<any> {
    const workersSnapshot = await getDocs(collection(db, "workers"));
    const workers = workersSnapshot.docs.map(doc => doc.data());

    return {
      total: workers.length,
      available: workers.filter(w => w.availability === 'available').length,
      busy: workers.filter(w => w.availability === 'busy').length,
      offline: workers.filter(w => w.availability === 'offline').length,
    };
  }
}

export const firebaseStorage = new FirebaseStorageService();