// Supabase storage types compatible with the existing application

export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan';
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertUser {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan';
  profileImageUrl?: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number;
  features: string[];
  active: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertService {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number;
  features: string[];
  active?: boolean;
  imageUrl?: string;
}

export interface Worker {
  id: number;
  userId: string;
  employeeId: string;
  name: string;
  phone: string;
  email?: string;
  specializations: string[];
  availability: 'available' | 'busy' | 'offline' | 'on_leave';
  location?: { lat: number; lng: number };
  locationAccuracy?: number;
  lastLocationUpdate?: Date;
  averageRating: number;
  totalJobs: number;
  joinDate: Date;
  profileImageUrl?: string;
  emergencyContact: string;
  equipment: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertWorker {
  userId: string;
  employeeId: string;
  name: string;
  phone: string;
  email?: string;
  specializations: string[];
  availability?: 'available' | 'busy' | 'offline' | 'on_leave';
  location?: { lat: number; lng: number };
  averageRating?: number;
  totalJobs?: number;
  joinDate?: Date;
  profileImageUrl?: string;
  emergencyContact: string;
  equipment: string[];
}

export interface Order {
  id: number;
  trackingId: string;
  customerId: string;
  workerId?: number;
  serviceId: number;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime: Date;
  estimatedDuration: number;
  basePrice: number;
  finalAmount: number;
  promoCode?: string;
  discount?: number;
  customerInfo: any;
  notes?: string;
  timeline: any[];
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface InsertOrder {
  trackingId: string;
  customerId: string;
  workerId?: number;
  serviceId: number;
  status?: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime: Date;
  estimatedDuration: number;
  basePrice: number;
  finalAmount: number;
  promoCode?: string;
  discount?: number;
  customerInfo: any;
  notes?: string;
  timeline?: any[];
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  rating?: number;
  review?: string;
}

export interface Address {
  id: number;
  userId: string;
  address: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertAddress {
  userId: string;
  address: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export interface Promotion {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  currentUses: number;
  expiresAt?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertPromotion {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  currentUses?: number;
  expiresAt?: Date;
  active?: boolean;
}

export interface Conversation {
  id: number;
  customerId: string;
  messages: any[];
  status: 'active' | 'resolved' | 'escalated';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertConversation {
  customerId: string;
  messages: any[];
  status?: 'active' | 'resolved' | 'escalated';
  lastMessageAt: Date;
}

// Storage interface for compatibility
export interface IStorage {
  // User operations
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