// Simplified storage interface for Supabase migration
export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan';
  profileImageUrl?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
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
  averageRating: number;
  totalJobs: number;
  joinDate: Date;
  profileImageUrl?: string;
  emergencyContact: string;
  equipment: string[];
  createdAt: Date;
  updatedAt: Date;
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
  customerInfo: any;
  notes?: string;
  timeline: any[];
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simple in-memory storage for development
class SimpleStorage {
  private users = new Map<string, User>();
  private services: Service[] = [];
  private workers: Worker[] = [];
  private orders: Order[] = [];

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample services
    this.services = [
      {
        id: 1,
        name: 'Cuci Mobil Reguler',
        description: 'Cuci mobil standar dengan sabun dan wax',
        category: 'cuci_mobil',
        basePrice: 25000,
        duration: 45,
        features: ['Cuci eksterior', 'Wax pelindung', 'Vakum interior'],
        active: true,
        imageUrl: '/images/cuci-mobil-reguler.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Cuci Mobil Premium',
        description: 'Cuci mobil lengkap dengan detailing',
        category: 'cuci_mobil',
        basePrice: 45000,
        duration: 90,
        features: ['Cuci eksterior', 'Cuci interior', 'Wax premium', 'Semir ban', 'Parfum'],
        active: true,
        imageUrl: '/images/cuci-mobil-premium.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Cuci Motor Reguler',
        description: 'Cuci motor standar dengan sabun',
        category: 'cuci_motor',
        basePrice: 15000,
        duration: 30,
        features: ['Cuci eksterior', 'Lap kering', 'Semir ban'],
        active: true,
        imageUrl: '/images/cuci-motor-reguler.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Potong Rumput Kecil',
        description: 'Potong rumput untuk area kecil (< 100m²)',
        category: 'potong_rumput',
        basePrice: 35000,
        duration: 60,
        features: ['Potong rumput', 'Bersih-bersih', 'Buang sampah'],
        active: true,
        imageUrl: '/images/potong-rumput-kecil.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample admin user
    this.users.set('admin-123', {
      id: 'admin-123',
      email: 'admin@tuntaskilat.com',
      phone: '+6281234567890',
      firstName: 'Admin',
      lastName: 'Tuntas Kilat',
      role: 'admin_perusahaan',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.phone === phone) return user;
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async upsertUser(userData: any): Promise<User> {
    console.log('💾 upsertUser called with:', { 
      email: userData.email, 
      hasPassword: !!userData.password,
      passwordLength: userData.password?.length 
    });
    
    const user: User = {
      id: userData.id || `user-${Date.now()}`,
      email: userData.email,
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'customer',
      profileImageUrl: userData.profileImageUrl,
      password: userData.password,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    console.log('💾 User object created:', { 
      id: user.id, 
      email: user.email, 
      hasPassword: !!user.password 
    });
    
    this.users.set(user.id, user);
    return user;
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return this.services.filter(s => s.active);
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.find(s => s.id === id);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return this.services.filter(s => s.category === category && s.active);
  }

  // Worker operations
  async getWorkers(): Promise<Worker[]> {
    return this.workers;
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    return this.workers.find(w => w.id === id);
  }

  async getWorkerByUserId(userId: string): Promise<Worker | undefined> {
    return this.workers.find(w => w.userId === userId);
  }

  async getAvailableWorkers(specialization?: string): Promise<Worker[]> {
    return this.workers.filter(w => {
      const isAvailable = w.availability === 'available';
      if (!specialization) return isAvailable;
      return isAvailable && w.specializations.includes(specialization);
    });
  }

  async updateWorkerLocation(id: number, lat: number, lng: number): Promise<void> {
    const worker = this.workers.find(w => w.id === id);
    if (worker) {
      worker.location = { lat, lng };
    }
  }

  // Order operations
  async getOrders(limit = 50): Promise<Order[]> {
    return this.orders.slice(0, limit);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.find(o => o.id === id);
  }

  async getOrderByTrackingId(trackingId: string): Promise<Order | undefined> {
    return this.orders.find(o => o.trackingId === trackingId);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.orders.filter(o => o.customerId === customerId);
  }

  async getOrdersByWorker(workerId: number): Promise<Order[]> {
    return this.orders.filter(o => o.workerId === workerId);
  }

  async getPendingOrders(): Promise<Order[]> {
    return this.orders.filter(o => o.status === 'pending');
  }

  async createOrder(orderData: any): Promise<Order> {
    const order: Order = {
      id: this.orders.length + 1,
      trackingId: orderData.trackingId || `TK-${Date.now()}`,
      customerId: orderData.customerId,
      workerId: orderData.workerId,
      serviceId: orderData.serviceId,
      status: orderData.status || 'pending',
      scheduledTime: orderData.scheduledTime,
      estimatedDuration: orderData.estimatedDuration,
      basePrice: orderData.basePrice,
      finalAmount: orderData.finalAmount,
      customerInfo: orderData.customerInfo,
      notes: orderData.notes,
      timeline: orderData.timeline || [],
      paymentStatus: orderData.paymentStatus || 'pending',
      rating: orderData.rating,
      review: orderData.review,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.push(order);
    return order;
  }

  async updateOrder(id: number, orderData: any): Promise<Order> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = this.orders[orderIndex];
    Object.assign(order, orderData, { updatedAt: new Date() });
    return order;
  }

  async updateOrderStatus(id: number, status: string, timeline: any[]): Promise<Order> {
    const order = await this.updateOrder(id, { status, timeline });
    return order;
  }

  // Analytics operations
  async getOrderStats(): Promise<any> {
    const total = this.orders.length;
    const pending = this.orders.filter(o => o.status === 'pending').length;
    const completed = this.orders.filter(o => o.status === 'completed').length;
    
    return { total, pending, completed };
  }

  async getRevenueStats(): Promise<any> {
    const totalRevenue = this.orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.finalAmount, 0);
    
    return { totalRevenue, completedOrders: this.orders.filter(o => o.status === 'completed').length };
  }

  async getWorkerStats(): Promise<any> {
    return { 
      total: this.workers.length, 
      available: this.workers.filter(w => w.availability === 'available').length 
    };
  }

  // Placeholder methods for compatibility
  async getUserAddresses(): Promise<any[]> { return []; }
  async createAddress(): Promise<any> { throw new Error('Not implemented'); }
  async updateAddress(): Promise<any> { throw new Error('Not implemented'); }
  async deleteAddress(): Promise<void> { }
  async createService(): Promise<any> { throw new Error('Not implemented'); }
  async updateService(): Promise<any> { throw new Error('Not implemented'); }
  async createWorker(): Promise<any> { throw new Error('Not implemented'); }
  async updateWorker(): Promise<any> { throw new Error('Not implemented'); }
  async getActivePromotions(): Promise<any[]> { return []; }
  async getPromotion(): Promise<any> { return undefined; }
  async createPromotion(): Promise<any> { throw new Error('Not implemented'); }
  async updatePromotion(): Promise<any> { throw new Error('Not implemented'); }
  async getConversation(): Promise<any> { return undefined; }
  async getConversationByCustomer(): Promise<any[]> { return []; }
  async createConversation(): Promise<any> { throw new Error('Not implemented'); }
  async updateConversation(): Promise<any> { throw new Error('Not implemented'); }
  async addMessageToConversation(): Promise<any> { throw new Error('Not implemented'); }
}

export const storage = new SimpleStorage();