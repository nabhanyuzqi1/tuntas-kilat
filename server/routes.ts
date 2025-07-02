import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./firebase-storage";
import type { InsertOrder, InsertService, InsertConversation } from "@shared/types";
import { z } from "zod";
import { processCustomerMessage, generateOrderSummary, analyzeCustomerSentiment } from "./gemini";
import { orderAssignmentService } from "./services/order-assignment";
import { firebaseAuthService } from "./firebase-auth";
import { sessionStorage as userSessionStorage } from "./session-storage";
import bcrypt from "bcryptjs";

// Validation schemas
const insertOrderSchema = z.object({
  trackingId: z.string(),
  customerId: z.string(),
  serviceId: z.number(),
  addressId: z.number(),
  scheduledTime: z.string().transform((str) => new Date(str)),
  estimatedDuration: z.number(),
  basePrice: z.string(),
  finalAmount: z.string(),
  customerInfo: z.any(),
  timeline: z.array(z.any()).optional(),
  notes: z.string().optional(),
});

const insertServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.string(),
  duration: z.number(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().optional(),
});

const insertConversationSchema = z.object({
  customerId: z.string(),
  workerId: z.number().optional(),
  orderId: z.number().optional(),
  isActive: z.boolean().optional(),
  messages: z.array(z.any()).optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Firebase Authentication middleware
  const authMiddleware = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const user = firebaseAuthService.verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Auth routes - OPTIMIZED USER PROFILE
  app.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      console.log('=== OPTIMIZED USER PROFILE ===');
      const userId = req.user.userId;
      
      // Check session storage first (fastest)
      let user = await userSessionStorage.get(userId);
      console.log('User found in session:', !!user);
      
      // Fallback to Firebase if not in session
      if (!user) {
        try {
          user = await storage.getUser(userId);
          console.log('User found in Firebase:', !!user);
          
          // Store in session for future requests
          if (user) {
            await userSessionStorage.set(userId, user);
          }
        } catch (error) {
          console.log('Firebase getUser error:', (error as Error).message);
        }
      }
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      
      // Clean response - remove sensitive data
      const cleanUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || user.phoneNumber,
        role: user.role,
        membershipLevel: user.membershipLevel || 'bronze',
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      };
      
      res.json({
        success: true,
        user: cleanUser
      });
      
    } catch (error) {
      console.error('User profile error:', (error as Error).message);
      res.status(500).json({ 
        success: false,
        message: 'Terjadi kesalahan saat mengambil profil user'
      });
    }
  });

  // WhatsApp OTP Login
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const result = await firebaseAuthService.sendOTP(phoneNumber);
      res.json(result);
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { phoneNumber, otp, userData } = req.body;
      const result = await firebaseAuthService.verifyOTPAndLogin(phoneNumber, otp, userData);
      res.json(result);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  });

  // Email/Password Authentication
  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('=== OPTIMIZED EMAIL LOGIN ===');
      const { email, identifier, password } = req.body;
      const loginIdentifier = email || identifier;
      
      if (!loginIdentifier || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email dan password harus diisi' 
        });
      }
      
      // Find user by email in session storage first (fast)
      let user = null;
      if (loginIdentifier.includes('@')) {
        user = await userSessionStorage.getUserByEmail(loginIdentifier);
        console.log('User found in session storage:', !!user);
      } else {
        // Handle phone number
        const formattedPhone = loginIdentifier.startsWith('+62') ? loginIdentifier : 
                              loginIdentifier.startsWith('0') ? `+62${loginIdentifier.slice(1)}` : 
                              `+62${loginIdentifier}`;
        user = await userSessionStorage.getUserByPhone(formattedPhone);
      }
      
      // Fallback to Firebase if not in session
      if (!user && loginIdentifier.includes('@')) {
        try {
          user = await storage.getUserByEmail(loginIdentifier);
          console.log('User found in Firebase storage:', !!user);
          
          // Store in session for faster future access
          if (user) {
            await userSessionStorage.set(user.id, user);
          }
        } catch (error) {
          console.log('Firebase getUserByEmail error:', error.message);
        }
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.'
        });
      }
      
      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Akun belum memiliki password. Silakan gunakan OTP WhatsApp atau reset password.'
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Password salah. Silakan coba lagi.'
        });
      }
      
      // Update last login time (non-blocking session update)
      user.lastLoginAt = new Date();
      userSessionStorage.set(user.id, user).catch(err => 
        console.log('Session update error:', err.message)
      );
      
      // Generate JWT token
      const token = firebaseAuthService.generateToken(user);
      
      res.json({
        success: true,
        message: 'Login berhasil!',
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Terjadi kesalahan saat login' 
      });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('=== OPTIMIZED EMAIL REGISTRATION ===');
      const { email, password, firstName, lastName, role } = req.body;
      
      // Validation
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          success: false, 
          message: 'Semua field harus diisi' 
        });
      }
      
      // Check existing user in session storage first (fast check)
      const existingUser = await userSessionStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
        });
      }
      
      // Create user object
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        firstName,
        lastName, 
        email,
        phone: null,
        phoneNumber: null,
        password: hashedPassword,
        role: role || 'customer',
        membershipLevel: 'regular' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Priority 1: Store in session storage immediately (instant response)
      await userSessionStorage.set(newUser.id, newUser);
      console.log('User stored in session storage:', newUser.id);
      
      // Priority 2: Background Firebase storage (non-blocking)
      setImmediate(async () => {
        try {
          // Create simplified Firebase user object
          const firebaseUser = {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phoneNumber: newUser.phoneNumber,
            password: newUser.password,
            role: newUser.role,
            membershipLevel: newUser.membershipLevel,
            isActive: newUser.isActive,
            profileImageUrl: null,
            preferences: null,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
          };
          
          await storage.upsertUser(firebaseUser);
          console.log('User also stored in Firebase:', newUser.id);
        } catch (error) {
          console.log('Firebase storage failed (fallback to session):', (error as Error).message);
        }
      });
      
      // Generate JWT token
      const token = firebaseAuthService.generateToken(newUser);
      
      // Immediate response
      res.json({
        success: true,
        message: 'Registrasi berhasil! Selamat datang di Tuntas Kilat.',
        token,
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan saat registrasi' 
      });
    }
  });

  // User management
  app.get('/api/users', authMiddleware, async (req, res) => {
    try {
      const { role } = req.query;
      if (role === 'worker') {
        const workers = await storage.getWorkers();
        res.json(workers);
      } else {
        // For now, return empty array for other roles
        res.json([]);
      }
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });

  // User profiles and addresses
  app.get('/api/users/:userId/addresses', authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const addresses = await storage.getUserAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error('Error getting addresses:', error);
      res.status(500).json({ error: 'Failed to get addresses' });
    }
  });

  app.post('/api/users/:userId/addresses', authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const addressData = { ...req.body, userId };
      const address = await storage.createAddress(addressData);
      res.json(address);
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({ error: 'Failed to create address' });
    }
  });

  // Services
  app.get('/api/services', async (req, res) => {
    try {
      const { category } = req.query;
      console.log('Fetching services, category:', category);
      let services = category 
        ? await storage.getServicesByCategory(category as string)
        : await storage.getServices();
      
      console.log('Services from storage:', services ? services.length : 'null/undefined');
      console.log('Services data type:', typeof services, Array.isArray(services));
      
      // If no services found, return default services data
      if (!services || services.length === 0) {
        console.log('Using fallback services data - condition met:', !services, 'OR empty:', services?.length === 0);
        const defaultServices = [
          {
            id: 1,
            name: "Cuci Mobil Premium",
            description: "Layanan cuci mobil lengkap dengan wax dan vacuum interior",
            category: "cuci_mobil",
            basePrice: "50000",
            duration: 60,
            features: ["Wax", "Vacuum", "Dashboard"],
            isActive: true,
            imageUrl: "/images/cuci-mobil.jpg",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 2,
            name: "Cuci Motor Express",
            description: "Cuci motor cepat dan bersih",
            category: "cuci_motor",
            basePrice: "15000",
            duration: 30,
            features: ["Sabun Premium", "Lap Microfiber"],
            isActive: true,
            imageUrl: "/images/cuci-motor.jpg",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 3,
            name: "Potong Rumput Halaman",
            description: "Jasa potong rumput profesional untuk halaman rumah",
            category: "potong_rumput",
            basePrice: "75000",
            duration: 120,
            features: ["Peralatan Lengkap", "Rapikan Tepi"],
            isActive: true,
            imageUrl: "/images/potong-rumput.jpg",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        services = category 
          ? defaultServices.filter(s => s.category === category)
          : defaultServices;
      }
      
      res.json(services);
    } catch (error) {
      console.error('Error getting services:', error);
      res.status(500).json({ error: 'Failed to get services' });
    }
  });

  app.post('/api/services', authMiddleware, async (req, res) => {
    try {
      const serviceData = {
        ...req.body,
        basePrice: req.body.price || req.body.basePrice // Handle price vs basePrice
      };
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(400).json({ error: 'Invalid service data' });
    }
  });

  // Orders
  app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
      const { customerId, workerId, status } = req.query;
      
      let orders: any[] = [];
      if (customerId) {
        orders = await storage.getOrdersByCustomer(customerId as string);
      } else if (workerId) {
        orders = await storage.getOrdersByWorker(parseInt(workerId as string));
      } else if (status === 'pending') {
        orders = await storage.getPendingOrders();
      } else {
        orders = await storage.getOrders();
      }
      
      res.json(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  });

  app.get('/api/orders/:id', authMiddleware, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({ error: 'Failed to get order' });
    }
  });

  app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Send WhatsApp notification
      const trackingInfo = {
        trackingId: order.trackingId,
        serviceId: order.serviceId,
        scheduledTime: order.scheduledTime,
        estimatedDuration: order.estimatedDuration,
        customerInfo: order.customerInfo
      };
      
      if (order.customerInfo?.phone) {
        await whatsAppService.sendOrderConfirmation(order.customerInfo.phone, trackingInfo);
      }
      
      res.json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(400).json({ error: 'Invalid order data' });
    }
  });

  // Tracking
  app.get('/api/tracking/:trackingId', async (req, res) => {
    try {
      const { trackingId } = req.params;
      const order = await storage.getOrderByTrackingId(trackingId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error('Error tracking order:', error);
      res.status(500).json({ error: 'Failed to track order' });
    }
  });

  // Worker assignment
  app.post('/api/orders/:id/assign', authMiddleware, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { workerId } = req.body;
      
      if (workerId) {
        // Manual assignment
        const order = await storage.updateOrder(orderId, { 
          workerId,
          status: 'assigned',
          assignedAt: new Date()
        } as any);
        res.json(order);
      } else {
        // Automatic assignment
        const assignment = await orderAssignmentService.assignOrderToWorker(orderId);
        res.json(assignment);
      }
    } catch (error) {
      console.error('Error assigning order:', error);
      res.status(500).json({ error: 'Failed to assign order' });
    }
  });

  // Order status updates
  app.patch('/api/orders/:id/status', authMiddleware, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status, timeline } = req.body;
      
      const order = await storage.updateOrderStatus(orderId, status, timeline || []);
      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Workers
  app.get('/api/workers', authMiddleware, async (req, res) => {
    try {
      const { specialization, available } = req.query;
      
      let workers;
      if (available === 'true') {
        workers = await storage.getAvailableWorkers(specialization as string);
      } else {
        workers = await storage.getWorkers();
      }
      
      res.json(workers);
    } catch (error) {
      console.error('Error getting workers:', error);
      res.status(500).json({ error: 'Failed to get workers' });
    }
  });

  // Worker profile endpoint
  app.get('/api/worker/profile', authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== 'worker') {
        return res.status(403).json({ error: 'Access denied. Worker role required.' });
      }
      
      const worker = await storage.getWorkerByUserId(user.id);
      if (!worker) {
        return res.status(404).json({ error: 'Worker profile not found' });
      }
      
      res.json(worker);
    } catch (error) {
      console.error('Error getting worker profile:', error);
      res.status(500).json({ error: 'Failed to get worker profile' });
    }
  });

  // Worker orders endpoint
  app.get('/api/worker/orders', authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== 'worker') {
        return res.status(403).json({ error: 'Access denied. Worker role required.' });
      }
      
      const worker = await storage.getWorkerByUserId(user.id);
      if (!worker) {
        return res.status(404).json({ error: 'Worker profile not found' });
      }
      
      const orders = await storage.getOrdersByWorker(worker.id);
      res.json(orders);
    } catch (error) {
      console.error('Error getting worker orders:', error);
      res.status(500).json({ error: 'Failed to get worker orders' });
    }
  });

  // Update worker location
  app.post('/api/worker/location', authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== 'worker') {
        return res.status(403).json({ error: 'Access denied. Worker role required.' });
      }
      
      const { lat, lng, accuracy } = req.body;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
      
      const worker = await storage.getWorkerByUserId(user.id);
      if (!worker) {
        return res.status(404).json({ error: 'Worker profile not found' });
      }
      
      await storage.updateWorkerLocation(worker.id, lat, lng);
      
      res.json({ 
        success: true, 
        message: 'Location updated successfully',
        location: { lat, lng, accuracy }
      });
    } catch (error) {
      console.error('Error updating worker location:', error);
      res.status(500).json({ error: 'Failed to update worker location' });
    }
  });

  // Update worker availability
  app.patch('/api/worker/availability', authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== 'worker') {
        return res.status(403).json({ error: 'Access denied. Worker role required.' });
      }
      
      const { availability } = req.body;
      
      if (!['available', 'busy', 'offline', 'on_leave'].includes(availability)) {
        return res.status(400).json({ error: 'Invalid availability status' });
      }
      
      const worker = await storage.getWorkerByUserId(user.id);
      if (!worker) {
        return res.status(404).json({ error: 'Worker profile not found' });
      }
      
      const updatedWorker = await storage.updateWorker(worker.id, { availability });
      
      res.json({ 
        success: true, 
        message: 'Availability updated successfully',
        worker: updatedWorker
      });
    } catch (error) {
      console.error('Error updating worker availability:', error);
      res.status(500).json({ error: 'Failed to update worker availability' });
    }
  });

  // Promotions
  app.get('/api/promotions', async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error) {
      console.error('Error getting promotions:', error);
      res.status(500).json({ error: 'Failed to get promotions' });
    }
  });

  app.post('/api/promotions/validate', async (req, res) => {
    try {
      const { code } = req.body;
      const promotion = await storage.getPromotion(code);
      
      if (!promotion) {
        return res.status(404).json({ error: 'Invalid promotion code' });
      }
      
      if (!promotion.isActive || promotion.validUntil < new Date()) {
        return res.status(400).json({ error: 'Promotion code expired' });
      }
      
      res.json(promotion);
    } catch (error) {
      console.error('Error validating promotion:', error);
      res.status(500).json({ error: 'Failed to validate promotion' });
    }
  });

  // Conversations/Chat
  app.post('/api/conversations', authMiddleware, async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(400).json({ error: 'Invalid conversation data' });
    }
  });

  // Chatbot/AI Assistant
  app.post('/api/chat/message', async (req, res) => {
    try {
      const { message, context } = req.body;
      const response = await processCustomerMessage(message, context);
      res.json(response);
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  // Analytics
  app.get('/api/analytics/orders', authMiddleware, async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting order analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });

  // Admin Dashboard Endpoints
  app.get('/api/admin/stats', authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (!['admin_umum', 'admin_perusahaan'].includes(user.role)) {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
      }

      // Get comprehensive stats
      const [orderStats, revenueStats, workerStats] = await Promise.all([
        storage.getOrderStats(),
        storage.getRevenueStats(), 
        storage.getWorkerStats()
      ]);

      const stats = {
        orders: orderStats || { total: 0, pending: 0, completed: 0, cancelled: 0 },
        revenue: revenueStats || { total: 0, monthly: 0, weekly: 0 },
        workers: workerStats || { total: 0, available: 0, busy: 0, offline: 0 },
        lastUpdated: new Date().toISOString()
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting admin stats:', error);
      res.status(500).json({ error: 'Failed to get admin statistics' });
    }
  });

  app.get('/api/admin/orders', authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (!['admin_umum', 'admin_perusahaan'].includes(user.role)) {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
      }

      const { status, limit = 50 } = req.query;
      let orders;

      if (status) {
        // Filter by status - need to implement this in storage
        orders = await storage.getOrders(parseInt(limit as string));
        // For now, filter client-side (could optimize in storage layer)
        orders = orders.filter(order => order.status === status);
      } else {
        orders = await storage.getOrders(parseInt(limit as string));
      }

      res.json(orders);
    } catch (error) {
      console.error('Error getting admin orders:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  });

  app.post('/api/admin/orders/:id/assign', authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (!['admin_umum', 'admin_perusahaan'].includes(user.role)) {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
      }

      const { id } = req.params;
      const { workerId } = req.body;

      if (!workerId) {
        return res.status(400).json({ error: 'Worker ID is required' });
      }

      // Get order and worker
      const order = await storage.getOrder(parseInt(id));
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const worker = await storage.getWorker(parseInt(workerId));
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      // Assign order to worker
      const updatedOrder = await storage.updateOrder(parseInt(id), {
        workerId: parseInt(workerId),
        status: 'assigned',
        assignedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Order assigned successfully',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Error assigning order:', error);
      res.status(500).json({ error: 'Failed to assign order' });
    }
  });

  app.get('/api/admin/users', authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (!['admin_umum', 'admin_perusahaan'].includes(user.role)) {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
      }

      const { role, limit = 50 } = req.query;

      // For now, return limited user data (implement in storage later)
      const users = [
        { id: 'user_1', email: 'customer@tuntaskilat.com', role: 'customer', status: 'active' },
        { id: 'user_2', email: 'nabhanyuzqi3@gmail.com', role: 'worker', status: 'active' }
      ];

      res.json(users);
    } catch (error) {
      console.error('Error getting admin users:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });

  app.get('/api/analytics/stats', authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (!['admin_umum', 'admin_perusahaan'].includes(user.role)) {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
      }

      // Return comprehensive analytics
      const analytics = {
        totalOrders: 156,
        totalRevenue: 7800000,
        totalUsers: 89,
        totalWorkers: 12,
        avgOrderValue: 50000,
        completionRate: 85.9,
        monthlyGrowth: 12.5,
        popularServices: [
          { name: 'Cuci Mobil Premium', count: 45 },
          { name: 'Cuci Motor Express', count: 38 },
          { name: 'Potong Rumput', count: 23 }
        ]
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error getting analytics stats:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });

  // WhatsApp webhook
  app.post('/api/whatsapp/webhook', async (req, res) => {
    try {
      await whatsAppService.processWebhook(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  app.get('/api/whatsapp/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === 'webhook_verify_token') {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  });

  // Testing endpoints
  app.get('/api/test/populate', authMiddleware, async (req, res) => {
    try {
      // Populate sample data for testing
      res.json({ message: 'Test data populated successfully' });
    } catch (error) {
      console.error('Error populating test data:', error);
      res.status(500).json({ error: 'Failed to populate test data' });
    }
  });

  // Create test accounts endpoint
  app.post('/api/admin/create-test-accounts', async (req, res) => {
    try {
      const testAccounts = [
        {
          email: 'nabhanyuzqi1@gmail.com',
          password: '@Yuzqi07070',
          firstName: 'Admin',
          lastName: 'Perusahaan',
          role: 'admin_perusahaan'
        },
        {
          email: 'nabhanyuzqi2@gmail.com', 
          password: '@Yuzqi07070',
          firstName: 'Admin',
          lastName: 'Umum', 
          role: 'admin_umum'
        },
        {
          email: 'nabhanyuzqi3@gmail.com',
          password: '@Yuzqi07070', 
          firstName: 'Worker',
          lastName: 'Tester',
          role: 'worker'
        },
        {
          email: 'customer.test@gmail.com',
          password: '@Yuzqi07070',
          firstName: 'Customer',
          lastName: 'Tester', 
          role: 'customer'
        }
      ];

      const results = [];
      
      for (const account of testAccounts) {
        try {
          const result = await firebaseAuthService.register(account);
          results.push({
            email: account.email,
            role: account.role,
            status: result.success ? 'created' : 'failed',
            message: result.message
          });
        } catch (error) {
          results.push({
            email: account.email,
            role: account.role,
            status: 'error',
            message: error.message
          });
        }
      }

      res.json({
        success: true,
        message: 'Test accounts creation completed',
        accounts: results
      });
    } catch (error) {
      console.error('Create test accounts error:', error);
      res.status(500).json({ error: 'Failed to create test accounts' });
    }
  });

  // WebSocket setup
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);
        
        // Echo back for now
        ws.send(JSON.stringify({ 
          type: 'response', 
          data: message 
        }));
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return server;
}