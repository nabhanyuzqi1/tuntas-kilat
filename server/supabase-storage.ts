import { supabase } from './supabase-client';

// Interfaces (Copied from storage-simple.ts for compatibility)
export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string; // Changed to required
  lastName: string; // Changed to required
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

class SupabaseStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
    return data as User;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
      
    if (error) {
      console.error('Error getting user by phone:', error);
      return undefined;
    }
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
    return data as User;
  }

  async upsertUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      throw new Error('Failed to upsert user.');
    }
    return data as User;
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Error getting services:', error);
      return [];
    }
    return data as Service[];
  }

  async getService(id: number): Promise<Service | undefined> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting service:', error);
      return undefined;
    }
    return data as Service;
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .eq('active', true);

    if (error) {
      console.error('Error getting services by category:', error);
      return [];
    }
    return data as Service[];
  }

  // Worker operations
  async getWorkers(): Promise<Worker[]> {
    const { data, error } = await supabase.from('workers').select('*');
    if (error) {
      console.error('Error getting workers:', error);
      return [];
    }
    return data as Worker[];
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error getting worker:', error);
      return undefined;
    }
    return data as Worker;
  }

  async getWorkerByUserId(userId: string): Promise<Worker | undefined> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('userId', userId)
      .single();
    if (error) {
      console.error('Error getting worker by user id:', error);
      return undefined;
    }
    return data as Worker;
  }

  async getAvailableWorkers(specialization?: string): Promise<Worker[]> {
    let query = supabase
      .from('workers')
      .select('*')
      .eq('availability', 'available');

    if (specialization) {
      query = query.contains('specializations', [specialization]);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error getting available workers:', error);
      return [];
    }
    return data as Worker[];
  }

  async updateWorkerLocation(id: number, lat: number, lng: number): Promise<void> {
    const { error } = await supabase
      .from('workers')
      .update({ location: { lat, lng } })
      .eq('id', id);
    if (error) {
      console.error('Error updating worker location:', error);
    }
  }

  // Order operations
  async getOrders(limit = 50): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error getting orders:', error);
      return [];
    }
    return data as Order[];
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting order:', error);
      return undefined;
    }
    return data as Order;
  }

  async getOrderByTrackingId(trackingId: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('trackingId', trackingId)
      .single();

    if (error) {
      console.error('Error getting order by tracking id:', error);
      return undefined;
    }
    return data as Order;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customerId', customerId);

    if (error) {
      console.error('Error getting orders by customer:', error);
      return [];
    }
    return data as Order[];
  }

  async getOrdersByWorker(workerId: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('workerId', workerId);

    if (error) {
      console.error('Error getting orders by worker:', error);
      return [];
    }
    return data as Order[];
  }

  async getPendingOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending');

    if (error) {
      console.error('Error getting pending orders:', error);
      return [];
    }
    return data as Order[];
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order.');
    }
    return data as Order;
  }

  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order.');
    }
    return data as Order;
  }

  async updateOrderStatus(id: number, status: Order['status'], timeline: any[]): Promise<Order> {
    const order = await this.updateOrder(id, { status, timeline });
    return order;
  }

  // Analytics operations
  async getOrderStats(): Promise<any> {
    // Get total orders
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting order count:', countError);
      return { total: 0, byStatus: {} };
    }

    // Get orders by status
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('status');

    if (ordersError) {
      console.error('Error getting orders by status:', ordersError);
      return { total: count || 0, byStatus: {} };
    }

    // Count orders by status manually
    const byStatus = orders.reduce((acc: Record<string, number>, order) => {
      const status = order.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: count || 0,
      byStatus
    };
  }

  async getRevenueStats(): Promise<any> {
    // Get total revenue
    const { data: totalRevenue, error: totalError } = await supabase
      .from('orders')
      .select('finalAmount')
      .eq('status', 'completed');

    if (totalError) {
      console.error('Error getting revenue stats:', totalError);
      return { total: 0, monthly: [] };
    }

    // Calculate total revenue
    const total = totalRevenue.reduce((sum, order) => sum + order.finalAmount, 0);

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: monthlyData, error: monthlyError } = await supabase
      .from('orders')
      .select('finalAmount, createdAt')
      .eq('status', 'completed')
      .gte('createdAt', sixMonthsAgo.toISOString());

    if (monthlyError) {
      console.error('Error getting monthly revenue:', monthlyError);
      return { total, monthly: [] };
    }

    // Group by month and calculate monthly totals
    const monthlyRevenue = monthlyData.reduce((acc: any[], order) => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      const existingMonth = acc.find(m => m.month === monthYear);
      if (existingMonth) {
        existingMonth.amount += order.finalAmount;
      } else {
        acc.push({ month: monthYear, amount: order.finalAmount });
      }
      
      return acc;
    }, []);

    return {
      total,
      monthly: monthlyRevenue
    };
  }

  async getWorkerStats(): Promise<any> {
    // Get worker counts
    const { count: totalWorkers, error: countError } = await supabase
      .from('workers')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting worker count:', countError);
      return { total: 0, available: 0, busy: 0 };
    }

    // Get available workers count
    const { count: availableWorkers, error: availableError } = await supabase
      .from('workers')
      .select('*', { count: 'exact', head: true })
      .eq('availability', 'available');

    if (availableError) {
      console.error('Error getting available worker count:', availableError);
      return { total: totalWorkers || 0, available: 0, busy: 0 };
    }

    // Get busy workers count
    const { count: busyWorkers, error: busyError } = await supabase
      .from('workers')
      .select('*', { count: 'exact', head: true })
      .eq('availability', 'busy');

    if (busyError) {
      console.error('Error getting busy worker count:', busyError);
      return { total: totalWorkers || 0, available: availableWorkers || 0, busy: 0 };
    }

    // Ensure values are not null before calculation
    const total = totalWorkers || 0;
    const available = availableWorkers || 0;
    const busy = busyWorkers || 0;
    
    return {
      total,
      available,
      busy,
      utilization: total > 0 ? (busy / total) * 100 : 0
    };
  }

  // Address operations
  async getUserAddresses(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('userId', userId);

    if (error) {
      console.error('Error getting user addresses:', error);
      return [];
    }
    return data;
  }

  async createAddress(addressData: any): Promise<any> {
    const { data, error } = await supabase
      .from('addresses')
      .insert(addressData)
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      throw new Error('Failed to create address.');
    }
    return data;
  }

  async updateAddress(id: number, addressData: any): Promise<any> {
    const { data, error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      throw new Error('Failed to update address.');
    }
    return data;
  }

  async deleteAddress(id: number): Promise<void> {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting address:', error);
      throw new Error('Failed to delete address.');
    }
  }
  async createService(serviceData: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      throw new Error('Failed to create service.');
    }
    return data as Service;
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      throw new Error('Failed to update service.');
    }
    return data as Service;
  }

  async createWorker(workerData: Partial<Worker>): Promise<Worker> {
    const { data, error } = await supabase
      .from('workers')
      .insert(workerData)
      .select()
      .single();

    if (error) {
      console.error('Error creating worker:', error);
      throw new Error('Failed to create worker.');
    }
    return data as Worker;
  }
  async updateWorker(id: number, workerData: Partial<Worker>): Promise<Worker> {
    const { data, error } = await supabase
      .from('workers')
      .update(workerData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating worker:', error);
      throw new Error('Failed to update worker.');
    }
    return data as Worker;
  }
  // Promotion operations
  async getActivePromotions(): Promise<any[]> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('isActive', true)
      .lte('startDate', new Date().toISOString())
      .gte('endDate', new Date().toISOString());

    if (error) {
      console.error('Error getting active promotions:', error);
      return [];
    }
    return data;
  }

  async getPromotion(code: string): Promise<any> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code)
      .eq('isActive', true)
      .lte('startDate', new Date().toISOString())
      .gte('endDate', new Date().toISOString())
      .single();

    if (error) {
      console.error('Error getting promotion:', error);
      return undefined;
    }
    return data;
  }

  async createPromotion(promotionData: any): Promise<any> {
    const { data, error } = await supabase
      .from('promotions')
      .insert(promotionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating promotion:', error);
      throw new Error('Failed to create promotion.');
    }
    return data;
  }

  async updatePromotion(code: string, promotionData: any): Promise<any> {
    const { data, error } = await supabase
      .from('promotions')
      .update(promotionData)
      .eq('code', code)
      .select()
      .single();

    if (error) {
      console.error('Error updating promotion:', error);
      throw new Error('Failed to update promotion.');
    }
    return data;
  }

  // Conversation operations
  async getConversation(id: number): Promise<any> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting conversation:', error);
      return undefined;
    }
    return data;
  }

  async getConversationByCustomer(customerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('customerId', customerId)
      .order('updatedAt', { ascending: false });

    if (error) {
      console.error('Error getting conversations by customer:', error);
      return [];
    }
    return data;
  }

  async createConversation(conversationData: any): Promise<any> {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation.');
    }
    return data;
  }

  async updateConversation(id: number, conversationData: any): Promise<any> {
    const { data, error } = await supabase
      .from('conversations')
      .update(conversationData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      throw new Error('Failed to update conversation.');
    }
    return data;
  }

  async addMessageToConversation(conversationId: number, message: any): Promise<any> {
    // First get the current conversation to access its messages
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add the new message to the messages array
    const messages = conversation.messages || [];
    messages.push({
      ...message,
      timestamp: new Date()
    });

    // Update the conversation with the new messages array
    return this.updateConversation(conversationId, {
      messages,
      updatedAt: new Date()
    });
  }
}

export const storage = new SupabaseStorage();