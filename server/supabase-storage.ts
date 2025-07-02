import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../shared/supabase-types'
import type { IStorage, User, UpsertUser, Service, InsertService, Worker, InsertWorker, Order, InsertOrder, Address, InsertAddress, Promotion, InsertPromotion, Conversation, InsertConversation } from './supabase-types'

// Server-side Supabase client with service key from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Environment check:', {
    VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY
  });
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file')
}

console.log('✅ Connecting to Supabase:', supabaseUrl.substring(0, 30) + '...')

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Type conversion helpers
function convertSupabaseUser(user: Database['public']['Tables']['users']['Row']): User {
  return {
    id: user.id,
    email: user.email || undefined,
    phone: user.phone || undefined,
    firstName: user.first_name || undefined,
    lastName: user.last_name || undefined,
    role: user.role,
    profileImageUrl: user.profile_image_url || undefined,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at)
  }
}

function convertSupabaseService(service: Database['public']['Tables']['services']['Row']): Service {
  return {
    id: service.id,
    name: service.name,
    description: service.description || '',
    category: service.category,
    basePrice: service.base_price,
    duration: service.duration,
    features: service.features,
    active: service.active,
    imageUrl: service.image_url || undefined,
    createdAt: new Date(service.created_at),
    updatedAt: new Date(service.updated_at)
  }
}

function convertSupabaseWorker(worker: Database['public']['Tables']['workers']['Row']): Worker {
  return {
    id: worker.id,
    userId: worker.user_id,
    employeeId: worker.employee_id,
    name: worker.name,
    phone: worker.phone,
    email: worker.email || undefined,
    specializations: worker.specializations,
    availability: worker.availability,
    location: worker.location ? { lat: 0, lng: 0 } : undefined, // TODO: Parse actual coordinates
    locationAccuracy: worker.location_accuracy || undefined,
    lastLocationUpdate: worker.last_location_update ? new Date(worker.last_location_update) : undefined,
    averageRating: worker.average_rating,
    totalJobs: worker.total_jobs,
    joinDate: new Date(worker.join_date),
    profileImageUrl: worker.profile_image_url || undefined,
    emergencyContact: worker.emergency_contact,
    equipment: worker.equipment,
    createdAt: new Date(worker.created_at),
    updatedAt: new Date(worker.updated_at)
  }
}

function convertSupabaseOrder(order: Database['public']['Tables']['orders']['Row']): Order {
  return {
    id: order.id,
    trackingId: order.tracking_id,
    customerId: order.customer_id,
    workerId: order.worker_id || undefined,
    serviceId: order.service_id,
    status: order.status,
    scheduledTime: new Date(order.scheduled_time),
    estimatedDuration: order.estimated_duration,
    basePrice: order.base_price,
    finalAmount: order.final_amount,
    promoCode: order.promo_code || undefined,
    discount: order.discount || undefined,
    customerInfo: order.customer_info,
    notes: order.notes || undefined,
    timeline: order.timeline,
    paymentMethod: order.payment_method || undefined,
    paymentStatus: order.payment_status,
    rating: order.rating || undefined,
    review: order.review || undefined,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
    assignedAt: order.assigned_at ? new Date(order.assigned_at) : undefined,
    startedAt: order.started_at ? new Date(order.started_at) : undefined,
    completedAt: order.completed_at ? new Date(order.completed_at) : undefined,
    cancelledAt: order.cancelled_at ? new Date(order.cancelled_at) : undefined
  }
}

export class SupabaseStorageImpl implements IStorage {
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) return undefined
    return convertSupabaseUser(data)
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()
    
    if (error || !data) return undefined
    return convertSupabaseUser(data)
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error || !data) return undefined
    return convertSupabaseUser(data)
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userRecord = {
      id: userData.id,
      email: userData.email || null,
      phone: userData.phone || null,
      first_name: userData.firstName || null,
      last_name: userData.lastName || null,
      role: userData.role || 'customer',
      profile_image_url: userData.profileImageUrl || null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(userRecord, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw new Error(`Failed to upsert user: ${error.message}`)
    return convertSupabaseUser(data)
  }

  // Address operations
  async getUserAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get addresses: ${error.message}`)
    
    return (data || []).map(addr => ({
      id: addr.id,
      userId: addr.user_id,
      address: addr.address,
      lat: addr.lat,
      lng: addr.lng,
      isDefault: addr.is_default,
      createdAt: new Date(addr.created_at),
      updatedAt: new Date(addr.updated_at)
    }))
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: address.userId,
        address: address.address,
        lat: address.lat,
        lng: address.lng,
        is_default: address.isDefault || false
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create address: ${error.message}`)
    
    return {
      id: data.id,
      userId: data.user_id,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      isDefault: data.is_default,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address> {
    const updateData: any = {}
    if (address.address !== undefined) updateData.address = address.address
    if (address.lat !== undefined) updateData.lat = address.lat
    if (address.lng !== undefined) updateData.lng = address.lng
    if (address.isDefault !== undefined) updateData.is_default = address.isDefault
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update address: ${error.message}`)
    
    return {
      id: data.id,
      userId: data.user_id,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      isDefault: data.is_default,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  async deleteAddress(id: number): Promise<void> {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete address: ${error.message}`)
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get services: ${error.message}`)
    return (data || []).map(convertSupabaseService)
  }

  async getService(id: number): Promise<Service | undefined> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return undefined
    return convertSupabaseService(data)
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get services by category: ${error.message}`)
    return (data || []).map(convertSupabaseService)
  }

  async createService(service: InsertService): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: service.name,
        description: service.description || null,
        category: service.category,
        base_price: service.basePrice,
        duration: service.duration,
        features: service.features,
        active: service.active !== false,
        image_url: service.imageUrl || null
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create service: ${error.message}`)
    return convertSupabaseService(data)
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const updateData: any = { updated_at: new Date().toISOString() }
    if (service.name !== undefined) updateData.name = service.name
    if (service.description !== undefined) updateData.description = service.description
    if (service.category !== undefined) updateData.category = service.category
    if (service.basePrice !== undefined) updateData.base_price = service.basePrice
    if (service.duration !== undefined) updateData.duration = service.duration
    if (service.features !== undefined) updateData.features = service.features
    if (service.active !== undefined) updateData.active = service.active
    if (service.imageUrl !== undefined) updateData.image_url = service.imageUrl

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update service: ${error.message}`)
    return convertSupabaseService(data)
  }

  // Worker operations
  async getWorkers(): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get workers: ${error.message}`)
    return (data || []).map(convertSupabaseWorker)
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return undefined
    return convertSupabaseWorker(data)
  }

  async getWorkerByUserId(userId: string): Promise<Worker | undefined> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) return undefined
    return convertSupabaseWorker(data)
  }

  async getAvailableWorkers(specialization?: string): Promise<Worker[]> {
    let query = supabase
      .from('workers')
      .select('*')
      .eq('availability', 'available')

    if (specialization) {
      query = query.contains('specializations', [specialization])
    }

    const { data, error } = await query.order('total_jobs', { ascending: true })

    if (error) throw new Error(`Failed to get available workers: ${error.message}`)
    return (data || []).map(convertSupabaseWorker)
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const { data, error } = await supabase
      .from('workers')
      .insert({
        user_id: worker.userId,
        employee_id: worker.employeeId,
        name: worker.name,
        phone: worker.phone,
        email: worker.email || null,
        specializations: worker.specializations,
        availability: worker.availability || 'available',
        location: null, // TODO: Handle PostGIS point
        average_rating: worker.averageRating || 0,
        total_jobs: worker.totalJobs || 0,
        join_date: worker.joinDate?.toISOString() || new Date().toISOString(),
        profile_image_url: worker.profileImageUrl || null,
        emergency_contact: worker.emergencyContact,
        equipment: worker.equipment
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create worker: ${error.message}`)
    return convertSupabaseWorker(data)
  }

  async updateWorker(id: number, worker: Partial<InsertWorker>): Promise<Worker> {
    const updateData: any = { updated_at: new Date().toISOString() }
    if (worker.name !== undefined) updateData.name = worker.name
    if (worker.phone !== undefined) updateData.phone = worker.phone
    if (worker.email !== undefined) updateData.email = worker.email
    if (worker.specializations !== undefined) updateData.specializations = worker.specializations
    if (worker.availability !== undefined) updateData.availability = worker.availability
    if (worker.averageRating !== undefined) updateData.average_rating = worker.averageRating
    if (worker.totalJobs !== undefined) updateData.total_jobs = worker.totalJobs
    if (worker.profileImageUrl !== undefined) updateData.profile_image_url = worker.profileImageUrl
    if (worker.emergencyContact !== undefined) updateData.emergency_contact = worker.emergencyContact
    if (worker.equipment !== undefined) updateData.equipment = worker.equipment

    const { data, error } = await supabase
      .from('workers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update worker: ${error.message}`)
    return convertSupabaseWorker(data)
  }

  async updateWorkerLocation(id: number, lat: number, lng: number): Promise<void> {
    const { error } = await supabase
      .from('workers')
      .update({
        location: `POINT(${lng} ${lat})`, // PostGIS format
        last_location_update: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw new Error(`Failed to update worker location: ${error.message}`)
  }

  // Order operations
  async getOrders(limit = 50): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to get orders: ${error.message}`)
    return (data || []).map(convertSupabaseOrder)
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return undefined
    return convertSupabaseOrder(data)
  }

  async getOrderByTrackingId(trackingId: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tracking_id', trackingId)
      .single()

    if (error || !data) return undefined
    return convertSupabaseOrder(data)
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get customer orders: ${error.message}`)
    return (data || []).map(convertSupabaseOrder)
  }

  async getOrdersByWorker(workerId: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get worker orders: ${error.message}`)
    return (data || []).map(convertSupabaseOrder)
  }

  async getPendingOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to get pending orders: ${error.message}`)
    return (data || []).map(convertSupabaseOrder)
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        tracking_id: order.trackingId,
        customer_id: order.customerId,
        worker_id: order.workerId || null,
        service_id: order.serviceId,
        status: order.status || 'pending',
        scheduled_time: order.scheduledTime.toISOString(),
        estimated_duration: order.estimatedDuration,
        base_price: order.basePrice,
        final_amount: order.finalAmount,
        promo_code: order.promoCode || null,
        discount: order.discount || null,
        customer_info: order.customerInfo,
        notes: order.notes || null,
        timeline: order.timeline || [],
        payment_method: order.paymentMethod || null,
        payment_status: order.paymentStatus || 'pending'
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create order: ${error.message}`)
    return convertSupabaseOrder(data)
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order> {
    const updateData: any = { updated_at: new Date().toISOString() }
    if (order.workerId !== undefined) updateData.worker_id = order.workerId
    if (order.status !== undefined) updateData.status = order.status
    if (order.scheduledTime !== undefined) updateData.scheduled_time = order.scheduledTime.toISOString()
    if (order.estimatedDuration !== undefined) updateData.estimated_duration = order.estimatedDuration
    if (order.basePrice !== undefined) updateData.base_price = order.basePrice
    if (order.finalAmount !== undefined) updateData.final_amount = order.finalAmount
    if (order.promoCode !== undefined) updateData.promo_code = order.promoCode
    if (order.discount !== undefined) updateData.discount = order.discount
    if (order.customerInfo !== undefined) updateData.customer_info = order.customerInfo
    if (order.notes !== undefined) updateData.notes = order.notes
    if (order.timeline !== undefined) updateData.timeline = order.timeline
    if (order.paymentMethod !== undefined) updateData.payment_method = order.paymentMethod
    if (order.paymentStatus !== undefined) updateData.payment_status = order.paymentStatus
    if (order.rating !== undefined) updateData.rating = order.rating
    if (order.review !== undefined) updateData.review = order.review

    // Set timestamp fields based on status
    if (order.status === 'assigned') updateData.assigned_at = new Date().toISOString()
    if (order.status === 'in_progress') updateData.started_at = new Date().toISOString()
    if (order.status === 'completed') updateData.completed_at = new Date().toISOString()
    if (order.status === 'cancelled') updateData.cancelled_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update order: ${error.message}`)
    return convertSupabaseOrder(data)
  }

  async updateOrderStatus(id: number, status: string, timeline: any[]): Promise<Order> {
    const updateData: any = {
      status,
      timeline,
      updated_at: new Date().toISOString()
    }

    // Set timestamp fields based on status
    if (status === 'assigned') updateData.assigned_at = new Date().toISOString()
    if (status === 'in_progress') updateData.started_at = new Date().toISOString()
    if (status === 'completed') updateData.completed_at = new Date().toISOString()
    if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update order status: ${error.message}`)
    return convertSupabaseOrder(data)
  }

  // Promotion operations
  async getActivePromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get active promotions: ${error.message}`)
    
    return (data || []).map(promo => ({
      id: promo.id,
      code: promo.code,
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
      minOrderAmount: promo.min_order_amount || undefined,
      maxUses: promo.max_uses || undefined,
      currentUses: promo.current_uses,
      expiresAt: promo.expires_at ? new Date(promo.expires_at) : undefined,
      active: promo.active,
      createdAt: new Date(promo.created_at),
      updatedAt: new Date(promo.updated_at)
    }))
  }

  async getPromotion(code: string): Promise<Promotion | undefined> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .single()

    if (error || !data) return undefined
    
    return {
      id: data.id,
      code: data.code,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      minOrderAmount: data.min_order_amount || undefined,
      maxUses: data.max_uses || undefined,
      currentUses: data.current_uses,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      active: data.active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const { data, error } = await supabase
      .from('promotions')
      .insert({
        code: promotion.code,
        discount_type: promotion.discountType,
        discount_value: promotion.discountValue,
        min_order_amount: promotion.minOrderAmount || null,
        max_uses: promotion.maxUses || null,
        current_uses: promotion.currentUses || 0,
        expires_at: promotion.expiresAt?.toISOString() || null,
        active: promotion.active !== false
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create promotion: ${error.message}`)
    
    return {
      id: data.id,
      code: data.code,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      minOrderAmount: data.min_order_amount || undefined,
      maxUses: data.max_uses || undefined,
      currentUses: data.current_uses,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      active: data.active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  async updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion> {
    const updateData: any = { updated_at: new Date().toISOString() }
    if (promotion.code !== undefined) updateData.code = promotion.code
    if (promotion.discountType !== undefined) updateData.discount_type = promotion.discountType
    if (promotion.discountValue !== undefined) updateData.discount_value = promotion.discountValue
    if (promotion.minOrderAmount !== undefined) updateData.min_order_amount = promotion.minOrderAmount
    if (promotion.maxUses !== undefined) updateData.max_uses = promotion.maxUses
    if (promotion.currentUses !== undefined) updateData.current_uses = promotion.currentUses
    if (promotion.expiresAt !== undefined) updateData.expires_at = promotion.expiresAt?.toISOString()
    if (promotion.active !== undefined) updateData.active = promotion.active

    const { data, error } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update promotion: ${error.message}`)
    
    return {
      id: data.id,
      code: data.code,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      minOrderAmount: data.min_order_amount || undefined,
      maxUses: data.max_uses || undefined,
      currentUses: data.current_uses,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      active: data.active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return undefined
    
    return {
      id: data.id,
      customerId: data.customer_id,
      messages: data.messages,
      status: data.status,
      lastMessageAt: new Date(data.last_message_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  async getConversationByCustomer(customerId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_id', customerId)
      .order('last_message_at', { ascending: false })

    if (error) throw new Error(`Failed to get conversations: ${error.message}`)
    
    return (data || []).map(conv => ({
      id: conv.id,
      customerId: conv.customer_id,
      messages: conv.messages,
      status: conv.status,
      lastMessageAt: new Date(conv.last_message_at),
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at)
    }))
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        customer_id: conversation.customerId,
        messages: conversation.messages,
        status: conversation.status || 'active',
        last_message_at: conversation.lastMessageAt.toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create conversation: ${error.message}`)
    
    return {
      id: data.id,
      customerId: data.customer_id,
      messages: data.messages,
      status: data.status,
      lastMessageAt: new Date(data.last_message_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  async updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation> {
    const updateData: any = { updated_at: new Date().toISOString() }
    if (conversation.messages !== undefined) updateData.messages = conversation.messages
    if (conversation.status !== undefined) updateData.status = conversation.status
    if (conversation.lastMessageAt !== undefined) updateData.last_message_at = conversation.lastMessageAt.toISOString()

    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update conversation: ${error.message}`)
    
    return {
      id: data.id,
      customerId: data.customer_id,
      messages: data.messages,
      status: data.status,
      lastMessageAt: new Date(data.last_message_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  async addMessageToConversation(id: number, message: any): Promise<Conversation> {
    // First get the current conversation
    const current = await this.getConversation(id)
    if (!current) throw new Error('Conversation not found')

    const updatedMessages = [...current.messages, message]
    
    return this.updateConversation(id, {
      messages: updatedMessages,
      lastMessageAt: new Date()
    })
  }

  // Analytics operations
  async getOrderStats(): Promise<any> {
    // Get basic order counts by status
    const { data: orderCounts, error: orderError } = await supabase
      .from('orders')
      .select('status')

    if (orderError) throw new Error(`Failed to get order stats: ${orderError.message}`)

    const stats = {
      total: orderCounts?.length || 0,
      pending: orderCounts?.filter(o => o.status === 'pending').length || 0,
      confirmed: orderCounts?.filter(o => o.status === 'confirmed').length || 0,
      assigned: orderCounts?.filter(o => o.status === 'assigned').length || 0,
      inProgress: orderCounts?.filter(o => o.status === 'in_progress').length || 0,
      completed: orderCounts?.filter(o => o.status === 'completed').length || 0,
      cancelled: orderCounts?.filter(o => o.status === 'cancelled').length || 0
    }

    return stats
  }

  async getRevenueStats(): Promise<any> {
    const { data, error } = await supabase
      .from('orders')
      .select('final_amount, status, created_at')
      .eq('payment_status', 'paid')

    if (error) throw new Error(`Failed to get revenue stats: ${error.message}`)

    const totalRevenue = data?.reduce((sum, order) => sum + order.final_amount, 0) || 0
    const completedOrders = data?.filter(o => o.status === 'completed') || []
    
    return {
      totalRevenue,
      completedOrders: completedOrders.length,
      averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
    }
  }

  async getWorkerStats(): Promise<any> {
    const { data, error } = await supabase
      .from('workers')
      .select('availability, total_jobs, average_rating')

    if (error) throw new Error(`Failed to get worker stats: ${error.message}`)

    const stats = {
      total: data?.length || 0,
      available: data?.filter(w => w.availability === 'available').length || 0,
      busy: data?.filter(w => w.availability === 'busy').length || 0,
      offline: data?.filter(w => w.availability === 'offline').length || 0,
      averageRating: data?.length ? (data.reduce((sum, w) => sum + w.average_rating, 0) / data.length) : 0,
      totalJobs: data?.reduce((sum, w) => sum + w.total_jobs, 0) || 0
    }

    return stats
  }
}

export const storage = new SupabaseStorageImpl()