// Firebase-compatible type definitions for Tuntas Kilat

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: 'customer' | 'worker' | 'admin';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertUser {
  id?: string;
  phone: string;
  email?: string;
  name: string;
  role: 'customer' | 'worker' | 'admin';
  avatar?: string;
  isActive?: boolean;
}

export interface Address {
  id: number;
  userId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface InsertAddress {
  userId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string;
  duration: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
}

export interface InsertService {
  name: string;
  description: string;
  category: string;
  price: string;
  duration: number;
  isActive?: boolean;
  imageUrl?: string;
}

export interface Worker {
  id: number;
  userId: string;
  employeeId: string;
  specializations: string[];
  availability: 'available' | 'busy' | 'offline' | 'on_leave';
  currentLat?: number;
  currentLng?: number;
  rating: number;
  totalJobs: number;
  joinDate: Date;
  phoneNumber: string;
  vehicleType?: string;
  vehiclePlate?: string;
  equipment: string[];
}

export interface InsertWorker {
  userId: string;
  employeeId: string;
  specializations: string[];
  availability?: 'available' | 'busy' | 'offline' | 'on_leave';
  currentLat?: number;
  currentLng?: number;
  phoneNumber: string;
  vehicleType?: string;
  vehiclePlate?: string;
  equipment?: string[];
}

export interface Order {
  id: number;
  trackingId: string;
  customerId: string;
  workerId?: number;
  serviceId: number;
  addressId: number;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime: Date;
  estimatedDuration: number;
  basePrice: string;
  finalAmount: string;
  customerInfo: any;
  timeline: any[];
  notes?: string;
  rating?: number;
  feedback?: string;
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface InsertOrder {
  trackingId: string;
  customerId: string;
  serviceId: number;
  addressId: number;
  scheduledTime: Date;
  estimatedDuration: number;
  basePrice: string;
  finalAmount: string;
  customerInfo: any;
  timeline?: any[];
  notes?: string;
}

export interface Promotion {
  id: number;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface InsertPromotion {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder?: number;
  maxUses?: number;
  validFrom: Date;
  validUntil: Date;
  isActive?: boolean;
}

export interface Conversation {
  id: number;
  customerId: string;
  workerId?: number;
  orderId?: number;
  isActive: boolean;
  lastMessage?: string;
  lastMessageAt?: Date;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertConversation {
  customerId: string;
  workerId?: number;
  orderId?: number;
  isActive?: boolean;
  messages?: any[];
}