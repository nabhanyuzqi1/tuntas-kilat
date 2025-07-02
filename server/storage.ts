import {
  users,
  addresses,
  services,
  workers,
  orders,
  promotions,
  conversations,
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
import { db } from "./db";
import { eq, desc, and, or, ilike, count } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phone));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Address operations
  async getUserAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address> {
    const [updatedAddress] = await db
      .update(addresses)
      .set(address)
      .where(eq(addresses.id, id))
      .returning();
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(and(eq(services.category, category), eq(services.isActive, true)));
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  // Worker operations
  async getWorkers(): Promise<Worker[]> {
    return await db.select().from(workers);
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.id, id));
    return worker;
  }

  async getWorkerByUserId(userId: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.userId, userId));
    return worker;
  }

  async getAvailableWorkers(specialization?: string): Promise<Worker[]> {
    let query = db.select().from(workers).where(eq(workers.availability, 'available'));
    
    if (specialization) {
      // Note: This would need proper JSON querying for specializations array
      query = query.where(eq(workers.availability, 'available'));
    }
    
    return await query;
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const [newWorker] = await db.insert(workers).values(worker).returning();
    return newWorker;
  }

  async updateWorker(id: number, worker: Partial<InsertWorker>): Promise<Worker> {
    const [updatedWorker] = await db
      .update(workers)
      .set({ ...worker, updatedAt: new Date() })
      .where(eq(workers.id, id))
      .returning();
    return updatedWorker;
  }

  async updateWorkerLocation(id: number, lat: number, lng: number): Promise<void> {
    await db
      .update(workers)
      .set({
        currentLat: lat.toString(),
        currentLng: lng.toString(),
        lastLocationUpdate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workers.id, id));
  }

  // Order operations
  async getOrders(limit = 50): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByTrackingId(trackingId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.trackingId, trackingId));
    return order;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByWorker(workerId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.workerId, workerId))
      .orderBy(desc(orders.createdAt));
  }

  async getPendingOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(or(eq(orders.status, 'pending'), eq(orders.status, 'confirmed')))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updateOrderStatus(id: number, status: string, timeline: any[]): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        timeline,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Promotion operations
  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.isActive, true),
          // Add date range checks here
        )
      );
  }

  async getPromotion(code: string): Promise<Promotion | undefined> {
    const [promotion] = await db
      .select()
      .from(promotions)
      .where(eq(promotions.code, code));
    return promotion;
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const [newPromotion] = await db.insert(promotions).values(promotion).returning();
    return newPromotion;
  }

  async updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion> {
    const [updatedPromotion] = await db
      .update(promotions)
      .set(promotion)
      .where(eq(promotions.id, id))
      .returning();
    return updatedPromotion;
  }

  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationByCustomer(customerId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.customerId, customerId))
      .orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation> {
    const [updatedConversation] = await db
      .update(conversations)
      .set({ ...conversation, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation;
  }

  async addMessageToConversation(id: number, message: any): Promise<Conversation> {
    // Get current conversation
    const current = await this.getConversation(id);
    if (!current) throw new Error('Conversation not found');

    const messages = Array.isArray(current.messages) ? current.messages : [];
    messages.push(message);

    return await this.updateConversation(id, { messages });
  }

  // Analytics operations
  async getOrderStats(): Promise<any> {
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalOrders] = await db
      .select({ count: count() })
      .from(orders);

    return {
      totalOrders: totalOrders.count,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    };
  }

  async getRevenueStats(): Promise<any> {
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      dailyRevenue: 0,
    };
  }

  async getWorkerStats(): Promise<any> {
    const [activeWorkers] = await db
      .select({ count: count() })
      .from(workers)
      .where(eq(workers.availability, 'available'));

    return {
      totalWorkers: 0,
      activeWorkers: activeWorkers.count,
      busyWorkers: 0,
    };
  }
}

export const storage = new DatabaseStorage();
