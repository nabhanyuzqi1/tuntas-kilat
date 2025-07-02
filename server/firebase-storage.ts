import { 
  firebaseStorage,
  type FirebaseUser,
  type FirebaseService,
  type FirebaseWorker,
  type FirebaseOrder,
  type FirebaseConversation
} from "@shared/firebase-services";
import { 
  type User,
  type UpsertUser,
  type Address,
  type InsertAddress,
  type Service,
  type InsertService,
  type Worker,
  type InsertWorker,
  type Order,
  type InsertOrder,
  type Promotion,
  type InsertPromotion,
  type Conversation,
  type InsertConversation,
} from "@shared/schema";
import bcrypt from "bcryptjs";

// Interface storage yang tetap sama untuk kompatibilitas
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Address operations
  getUserAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number): Promise<void>;
  
  // Service operations
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getServicesByCategory(category: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  
  // Worker operations
  getWorkers(): Promise<Worker[]>;
  getWorker(id: number): Promise<Worker | undefined>;
  getWorkerByUserId(userId: string): Promise<Worker | undefined>;
  getAvailableWorkers(specialization?: string): Promise<Worker[]>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: number, worker: Partial<InsertWorker>): Promise<Worker>;
  updateWorkerLocation(id: number, lat: number, lng: number): Promise<void>;
  
  // Order operations
  getOrders(limit?: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByTrackingId(trackingId: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByWorker(workerId: number): Promise<Order[]>;
  getPendingOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;
  updateOrderStatus(id: number, status: string, timeline: any[]): Promise<Order>;
  
  // Promotion operations
  getActivePromotions(): Promise<Promotion[]>;
  getPromotion(code: string): Promise<Promotion | undefined>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion>;
  
  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByCustomer(customerId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation>;
  addMessageToConversation(id: number, message: any): Promise<Conversation>;
  
  // Analytics operations
  getOrderStats(): Promise<any>;
  getRevenueStats(): Promise<any>;
  getWorkerStats(): Promise<any>;
}

// Convert functions untuk mengubah Firebase data ke format PostgreSQL
function convertFirebaseUserToUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.id,
    email: fbUser.email || null,
    firstName: fbUser.firstName || null,
    lastName: fbUser.lastName || null,
    profileImageUrl: fbUser.profileImageUrl || null,
    phoneNumber: null, // Firebase users don't have phone directly
    password: null,
    role: fbUser.role || 'customer',
    isActive: true,
    lastLoginAt: null,
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    createdAt: fbUser.createdAt?.toDate() || new Date(),
    updatedAt: fbUser.updatedAt?.toDate() || new Date(),
  };
}

function convertFirebaseServiceToService(fbService: FirebaseService, index: number): Service {
  return {
    id: index + 1, // Generate numeric ID
    name: fbService.name,
    description: fbService.description,
    category: fbService.category as "cuci_mobil" | "cuci_motor" | "potong_rumput",
    basePrice: fbService.basePrice.toString(),
    duration: fbService.duration,
    features: fbService.features,
    active: fbService.active,
    imageUrl: fbService.imageUrl || null,
    createdAt: fbService.createdAt?.toDate() || new Date(),
    updatedAt: fbService.updatedAt?.toDate() || new Date(),
  };
}

function convertFirebaseWorkerToWorker(fbWorker: FirebaseWorker, index: number): Worker {
  return {
    id: index + 1,
    userId: fbWorker.userId,
    employeeId: fbWorker.employeeId,
    specializations: fbWorker.specializations,
    availability: fbWorker.availability || 'available',
    location: fbWorker.location ? {
      lat: fbWorker.location.latitude,
      lng: fbWorker.location.longitude
    } : null,
    locationAccuracy: fbWorker.locationAccuracy || null,
    lastLocationUpdate: fbWorker.lastLocationUpdate?.toDate() || null,
    averageRating: fbWorker.averageRating,
    totalJobs: fbWorker.totalJobs,
    joinDate: fbWorker.joinDate?.toDate() || new Date(),
    profileImageUrl: fbWorker.profileImageUrl || null,
    emergencyContact: fbWorker.emergencyContact,
    equipment: fbWorker.equipment,
    createdAt: fbWorker.createdAt?.toDate() || new Date(),
    updatedAt: fbWorker.updatedAt?.toDate() || new Date(),
  };
}

function convertFirebaseOrderToOrder(fbOrder: FirebaseOrder, index: number): Order {
  return {
    id: index + 1,
    trackingId: fbOrder.trackingId,
    customerId: fbOrder.customerId,
    workerId: null, // Will be handled separately
    serviceId: null, // Will be handled separately  
    status: fbOrder.status,
    scheduledTime: fbOrder.scheduledTime?.toDate() || new Date(),
    estimatedDuration: fbOrder.estimatedDuration,
    basePrice: fbOrder.basePrice.toString(),
    finalAmount: fbOrder.finalAmount.toString(),
    promoCode: fbOrder.promoCode || null,
    discount: fbOrder.discount?.toString() || null,
    customerInfo: fbOrder.customerInfo,
    notes: fbOrder.notes || null,
    timeline: fbOrder.timeline.map(t => ({
      ...t,
      timestamp: t.timestamp?.toDate() || new Date()
    })),
    paymentMethod: fbOrder.paymentMethod || null,
    paymentStatus: fbOrder.paymentStatus,
    rating: fbOrder.rating || null,
    review: fbOrder.review || null,
    createdAt: fbOrder.createdAt?.toDate() || new Date(),
    updatedAt: fbOrder.updatedAt?.toDate() || new Date(),
    assignedAt: fbOrder.assignedAt?.toDate() || null,
    startedAt: fbOrder.startedAt?.toDate() || null,
    completedAt: fbOrder.completedAt?.toDate() || null,
    cancelledAt: fbOrder.cancelledAt?.toDate() || null,
  };
}

// Firebase Storage Implementation
// Simple in-memory storage for development
const memoryUsers: Map<string, User> = new Map();
const memoryUsersByEmail: Map<string, User> = new Map();
const memoryUsersByPhone: Map<string, User> = new Map();

export class FirebaseStorageImpl implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const fbUser = await firebaseStorage.getUser(id);
      return fbUser ? convertFirebaseUserToUser(fbUser) : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    try {
      // Menggunakan firebaseStorage untuk mencari user berdasarkan phone
      const users = await firebaseStorage.getUsers();
      const userWithPhone = users.find(user => 
        user.phone === phone || user.phoneNumber === phone
      );
      
      return userWithPhone ? convertFirebaseUserToUser(userWithPhone) : undefined;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // First, check session storage for registered users
      const { sessionStorage } = await import('./session-storage');
      const sessionUser = await sessionStorage.getByIdentifier(email);
      
      if (sessionUser) {
        return sessionUser;
      }

      console.log('User not found in session storage, email:', email);
      return undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // Convert UpsertUser to FirebaseUser format
      const fbUserData = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        role: userData.role,
      };

      let userId: string;
      if (userData.id) {
        // Update existing user
        await firebaseStorage.updateUser(userData.id, fbUserData);
        userId = userData.id;
      } else {
        // Create new user
        userId = await firebaseStorage.createUser(fbUserData);
      }

      const updatedUser = await firebaseStorage.getUser(userId);
      return convertFirebaseUserToUser(updatedUser!);
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  // Address operations - Firebase doesn't have addresses, return empty for now
  async getUserAddresses(userId: string): Promise<Address[]> {
    return [];
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    throw new Error('Address operations not implemented in Firebase');
  }

  async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address> {
    throw new Error('Address operations not implemented in Firebase');
  }

  async deleteAddress(id: number): Promise<void> {
    throw new Error('Address operations not implemented in Firebase');
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    try {
      const fbServices = await firebaseStorage.getServices();
      return fbServices.map((service, index) => convertFirebaseServiceToService(service, index));
    } catch (error) {
      console.error('Error getting services:', error);
      return [];
    }
  }

  async getService(id: number): Promise<Service | undefined> {
    try {
      const services = await this.getServices();
      return services.find(s => s.id === id);
    } catch (error) {
      console.error('Error getting service:', error);
      return undefined;
    }
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      const services = await this.getServices();
      return services.filter(s => s.category === category);
    } catch (error) {
      console.error('Error getting services by category:', error);
      return [];
    }
  }

  async createService(service: InsertService): Promise<Service> {
    try {
      const fbServiceData = {
        name: service.name,
        description: service.description,
        category: service.category,
        basePrice: parseFloat(service.basePrice),
        duration: service.duration,
        features: service.features,
        active: service.active,
        imageUrl: service.imageUrl,
      };

      const serviceId = await firebaseStorage.createService(fbServiceData);
      const newService = await firebaseStorage.getService(serviceId);
      return convertFirebaseServiceToService(newService!, 0);
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    throw new Error('Service update not implemented');
  }

  // Worker operations
  async getWorkers(): Promise<Worker[]> {
    try {
      const fbWorkers = await firebaseStorage.getWorkers();
      return fbWorkers.map((worker, index) => convertFirebaseWorkerToWorker(worker, index));
    } catch (error) {
      console.error('Error getting workers:', error);
      return [];
    }
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    try {
      const workers = await this.getWorkers();
      return workers.find(w => w.id === id);
    } catch (error) {
      console.error('Error getting worker:', error);
      return undefined;
    }
  }

  async getWorkerByUserId(userId: string): Promise<Worker | undefined> {
    try {
      const fbWorker = await firebaseStorage.getWorkerByUserId(userId);
      return fbWorker ? convertFirebaseWorkerToWorker(fbWorker, 0) : undefined;
    } catch (error) {
      console.error('Error getting worker by user ID:', error);
      return undefined;
    }
  }

  async getAvailableWorkers(specialization?: string): Promise<Worker[]> {
    try {
      const fbWorkers = await firebaseStorage.getAvailableWorkers(specialization);
      return fbWorkers.map((worker, index) => convertFirebaseWorkerToWorker(worker, index));
    } catch (error) {
      console.error('Error getting available workers:', error);
      return [];
    }
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    throw new Error('Worker creation not implemented');
  }

  async updateWorker(id: number, worker: Partial<InsertWorker>): Promise<Worker> {
    throw new Error('Worker update not implemented');
  }

  async updateWorkerLocation(id: number, lat: number, lng: number): Promise<void> {
    try {
      const workers = await this.getWorkers();
      const worker = workers.find(w => w.id === id);
      if (worker && worker.userId) {
        const fbWorker = await firebaseStorage.getWorkerByUserId(worker.userId);
        if (fbWorker) {
          await firebaseStorage.updateWorkerLocation(fbWorker.id, lat, lng);
        }
      }
    } catch (error) {
      console.error('Error updating worker location:', error);
    }
  }

  // Order operations
  async getOrders(limit = 50): Promise<Order[]> {
    try {
      const fbOrders = await firebaseStorage.getOrders(limit);
      return fbOrders.map((order, index) => convertFirebaseOrderToOrder(order, index));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    try {
      const orders = await this.getOrders();
      return orders.find(o => o.id === id);
    } catch (error) {
      console.error('Error getting order:', error);
      return undefined;
    }
  }

  async getOrderByTrackingId(trackingId: string): Promise<Order | undefined> {
    try {
      const fbOrder = await firebaseStorage.getOrderByTrackingId(trackingId);
      return fbOrder ? convertFirebaseOrderToOrder(fbOrder, 0) : undefined;
    } catch (error) {
      console.error('Error getting order by tracking ID:', error);
      return undefined;
    }
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const fbOrders = await firebaseStorage.getOrdersByCustomer(customerId);
      return fbOrders.map((order, index) => convertFirebaseOrderToOrder(order, index));
    } catch (error) {
      console.error('Error getting orders by customer:', error);
      return [];
    }
  }

  async getOrdersByWorker(workerId: number): Promise<Order[]> {
    try {
      // Convert numeric worker ID to Firebase worker ID
      const worker = await this.getWorker(workerId);
      if (!worker?.userId) return [];
      
      const fbWorker = await firebaseStorage.getWorkerByUserId(worker.userId);
      if (!fbWorker) return [];
      
      const fbOrders = await firebaseStorage.getOrdersByWorker(fbWorker.id);
      return fbOrders.map((order, index) => convertFirebaseOrderToOrder(order, index));
    } catch (error) {
      console.error('Error getting orders by worker:', error);
      return [];
    }
  }

  async getPendingOrders(): Promise<Order[]> {
    try {
      const orders = await this.getOrders();
      return orders.filter(o => o.status === 'pending');
    } catch (error) {
      console.error('Error getting pending orders:', error);
      return [];
    }
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      const fbOrderData = {
        trackingId: order.trackingId,
        customerId: order.customerId || '',
        serviceId: '', // Will need to convert
        status: order.status || 'pending',
        scheduledTime: order.scheduledTime,
        estimatedDuration: order.estimatedDuration,
        basePrice: parseFloat(order.basePrice),
        finalAmount: parseFloat(order.finalAmount),
        promoCode: order.promoCode,
        discount: order.discount ? parseFloat(order.discount) : undefined,
        customerInfo: order.customerInfo,
        notes: order.notes,
        timeline: order.timeline || [],
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus || 'pending',
        rating: order.rating,
        review: order.review,
      };

      const orderId = await firebaseStorage.createOrder(fbOrderData);
      const newOrder = await firebaseStorage.getOrder(orderId);
      return convertFirebaseOrderToOrder(newOrder!, 0);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order> {
    throw new Error('Order update not implemented');
  }

  async updateOrderStatus(id: number, status: string, timeline: any[]): Promise<Order> {
    throw new Error('Order status update not implemented');
  }

  // Promotion operations - placeholder implementations
  async getActivePromotions(): Promise<Promotion[]> {
    return [];
  }

  async getPromotion(code: string): Promise<Promotion | undefined> {
    return undefined;
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    throw new Error('Promotion operations not implemented');
  }

  async updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion> {
    throw new Error('Promotion operations not implemented');
  }

  // Conversation operations - placeholder implementations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return undefined;
  }

  async getConversationByCustomer(customerId: string): Promise<Conversation[]> {
    return [];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    throw new Error('Conversation operations not implemented');
  }

  async updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation> {
    throw new Error('Conversation operations not implemented');
  }

  async addMessageToConversation(id: number, message: any): Promise<Conversation> {
    throw new Error('Conversation operations not implemented');
  }

  // Analytics operations
  async getOrderStats(): Promise<any> {
    try {
      return await firebaseStorage.getOrderStats();
    } catch (error) {
      console.error('Error getting order stats:', error);
      return {};
    }
  }

  async getRevenueStats(): Promise<any> {
    try {
      return await firebaseStorage.getRevenueStats();
    } catch (error) {
      console.error('Error getting revenue stats:', error);
      return {};
    }
  }

  async getWorkerStats(): Promise<any> {
    try {
      return await firebaseStorage.getWorkerStats();
    } catch (error) {
      console.error('Error getting worker stats:', error);
      return {};
    }
  }
}

export const storage = new FirebaseStorageImpl();