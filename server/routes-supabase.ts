import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage-simple";
import { z } from "zod";
import { processCustomerMessage, generateOrderSummary, analyzeCustomerSentiment } from "./gemini";
import { quickAuthFix } from "./quick-auth-fix";
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
  const httpServer = createServer(app);

  // Authentication middleware
  const authMiddleware = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const user = await quickAuthFix.verifySession(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  };

  // API routes only - let Vite handle client routes

  // WhatsApp OTP Authentication
  app.post('/api/auth/whatsapp/send-otp', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const result = await quickAuthFix.sendOTP(phoneNumber);
      res.json(result);
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });

  app.post('/api/auth/whatsapp/verify-otp', async (req, res) => {
    try {
      const { phoneNumber, otp, userData } = req.body;
      if (!phoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
      }

      const result = await quickAuthFix.verifyOTPAndLogin(phoneNumber, otp, userData);
      
      if (result.success && result.user) {
        await userSessionStorage.set(result.token!, result.user);
      }

      res.json(result);
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  });

  // Email Authentication
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await quickAuthFix.register({
        email,
        password,
        firstName,
        lastName,
        phone
      });

      if (result.success && result.user) {
        await userSessionStorage.set(result.token!, result.user);
      }

      res.json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, identifier, password } = req.body;
      const loginIdentifier = email || identifier;
      console.log('🔑 Login request received:', { identifier: loginIdentifier, password: '***' });
      
      if (!loginIdentifier || !password) {
        return res.status(400).json({ error: 'Email/phone and password are required' });
      }

      console.log('📞 Calling quickAuthFix.login...');
      const result = await quickAuthFix.login(loginIdentifier, password);
      console.log('📝 Login result:', { success: result.success, message: result.message });

      if (result.success && result.user) {
        await userSessionStorage.set(result.token!, result.user);
      }

      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  // Firebase Authentication Routes
  app.post('/api/auth/firebase/verify', async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: 'Firebase ID token is required' });
      }

      const result = await firebaseAuthService.verifyFirebaseToken(idToken);
      res.json(result);
    } catch (error) {
      console.error('Firebase auth error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  app.post('/api/auth/firebase/custom-token', async (req, res) => {
    try {
      const { uid } = req.body;
      if (!uid) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const customToken = await firebaseAuthService.createCustomToken(uid);
      res.json({ customToken });
    } catch (error) {
      console.error('Custom token error:', error);
      res.status(500).json({ error: 'Failed to create custom token' });
    }
  });

  // User Profile
  app.get('/api/user/profile', authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  // Services
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error('Get services error:', error);
      res.status(500).json({ error: 'Failed to get services' });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service);
    } catch (error) {
      console.error('Get service error:', error);
      res.status(500).json({ error: 'Failed to get service' });
    }
  });

  app.get('/api/services/category/:category', async (req, res) => {
    try {
      const services = await storage.getServicesByCategory(req.params.category);
      res.json(services);
    } catch (error) {
      console.error('Get services by category error:', error);
      res.status(500).json({ error: 'Failed to get services' });
    }
  });

  // Workers
  app.get('/api/workers', async (req, res) => {
    try {
      const workers = await storage.getWorkers();
      res.json(workers);
    } catch (error) {
      console.error('Get workers error:', error);
      res.status(500).json({ error: 'Failed to get workers' });
    }
  });

  app.get('/api/workers/available', async (req, res) => {
    try {
      const specialization = req.query.specialization as string;
      const workers = await storage.getAvailableWorkers(specialization);
      res.json(workers);
    } catch (error) {
      console.error('Get available workers error:', error);
      res.status(500).json({ error: 'Failed to get available workers' });
    }
  });

  // Orders
  app.get('/api/orders', authMiddleware, async (req: any, res) => {
    try {
      let orders;
      if (req.user.role === 'customer') {
        orders = await storage.getOrdersByCustomer(req.user.id);
      } else if (req.user.role === 'worker') {
        const worker = await storage.getWorkerByUserId(req.user.id);
        if (worker) {
          orders = await storage.getOrdersByWorker(worker.id);
        } else {
          orders = [];
        }
      } else {
        orders = await storage.getOrders();
      }
      res.json(orders);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  });

  app.post('/api/orders', authMiddleware, async (req: any, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      const newOrder = await storage.createOrder({
        ...orderData,
        customerId: req.user.id,
        basePrice: parseFloat(orderData.basePrice),
        finalAmount: parseFloat(orderData.finalAmount),
        paymentStatus: 'pending',
        timeline: [{
          status: 'pending',
          timestamp: new Date(),
          note: 'Order created'
        }]
      });

      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Create order error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid order data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  app.get('/api/orders/:id', authMiddleware, async (req: any, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if user has permission to view this order
      if (req.user.role === 'customer' && order.customerId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (req.user.role === 'worker') {
        const worker = await storage.getWorkerByUserId(req.user.id);
        if (!worker || order.workerId !== worker.id) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      res.json(order);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Failed to get order' });
    }
  });

  app.put('/api/orders/:id/status', authMiddleware, async (req: any, res) => {
    try {
      const { status, note } = req.body;
      const orderId = parseInt(req.params.id);

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Build new timeline
      const newTimeline = [...order.timeline, {
        status,
        timestamp: new Date(),
        note: note || `Status changed to ${status}`,
        updatedBy: req.user.role
      }];

      const updatedOrder = await storage.updateOrderStatus(orderId, status, newTimeline);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Worker-specific routes
  app.get('/api/worker/profile', authMiddleware, async (req: any, res) => {
    try {
      const worker = await storage.getWorkerByUserId(req.user.id);
      if (!worker) {
        return res.status(404).json({ error: 'Worker profile not found' });
      }
      res.json(worker);
    } catch (error) {
      console.error('Get worker profile error:', error);
      res.status(500).json({ error: 'Failed to get worker profile' });
    }
  });

  app.get('/api/worker/orders', authMiddleware, async (req: any, res) => {
    try {
      const worker = await storage.getWorkerByUserId(req.user.id);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      
      const orders = await storage.getOrdersByWorker(worker.id);
      res.json(orders);
    } catch (error) {
      console.error('Get worker orders error:', error);
      res.status(500).json({ error: 'Failed to get worker orders' });
    }
  });

  app.put('/api/worker/location', authMiddleware, async (req: any, res) => {
    try {
      const { lat, lng } = req.body;
      const worker = await storage.getWorkerByUserId(req.user.id);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      await storage.updateWorkerLocation(worker.id, lat, lng);
      res.json({ success: true, message: 'Location updated' });
    } catch (error) {
      console.error('Update worker location error:', error);
      res.status(500).json({ error: 'Failed to update location' });
    }
  });

  app.put('/api/worker/availability', authMiddleware, async (req: any, res) => {
    try {
      const { availability } = req.body;
      const worker = await storage.getWorkerByUserId(req.user.id);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      const updatedWorker = await storage.updateWorker(worker.id, { availability });
      res.json(updatedWorker);
    } catch (error) {
      console.error('Update worker availability error:', error);
      res.status(500).json({ error: 'Failed to update availability' });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', authMiddleware, async (req: any, res) => {
    try {
      if (!['admin_umum', 'admin_perusahaan'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const [orderStats, revenueStats, workerStats] = await Promise.all([
        storage.getOrderStats(),
        storage.getRevenueStats(),
        storage.getWorkerStats()
      ]);

      res.json({
        orders: orderStats,
        revenue: revenueStats,
        workers: workerStats
      });
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ error: 'Failed to get admin stats' });
    }
  });

  app.get('/api/admin/orders', authMiddleware, async (req: any, res) => {
    try {
      if (!['admin_umum', 'admin_perusahaan'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const status = req.query.status as string;
      let orders;

      if (status === 'pending') {
        orders = await storage.getPendingOrders();
      } else {
        orders = await storage.getOrders();
      }

      res.json(orders);
    } catch (error) {
      console.error('Get admin orders error:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  });

  app.put('/api/admin/orders/:id/assign', authMiddleware, async (req: any, res) => {
    try {
      if (!['admin_umum', 'admin_perusahaan'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { workerId } = req.body;
      const orderId = parseInt(req.params.id);

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const worker = await storage.getWorker(workerId);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      // Update order with worker assignment
      const updatedOrder = await storage.updateOrder(orderId, {
        workerId: workerId,
        status: 'assigned'
      });

      // Update worker status to busy
      await storage.updateWorker(workerId, { availability: 'busy' });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Assign order error:', error);
      res.status(500).json({ error: 'Failed to assign order' });
    }
  });

  // Promotions
  app.get('/api/promotions', async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error) {
      console.error('Get promotions error:', error);
      res.status(500).json({ error: 'Failed to get promotions' });
    }
  });

  app.get('/api/promotions/:code', async (req, res) => {
    try {
      const promotion = await storage.getPromotion(req.params.code);
      if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
      }
      res.json(promotion);
    } catch (error) {
      console.error('Get promotion error:', error);
      res.status(500).json({ error: 'Failed to get promotion' });
    }
  });

  // Chatbot
  app.post('/api/chatbot/message', async (req, res) => {
    try {
      const { message, customerId, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await processCustomerMessage(message, context);
      res.json(response);
    } catch (error) {
      console.error('Chatbot error:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  // Analytics
  app.get('/api/analytics/stats', authMiddleware, async (req: any, res) => {
    try {
      if (!['admin_umum', 'admin_perusahaan'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const services = await storage.getServices();
      const popularServices = services.slice(0, 5); // Top 5 services

      const stats = {
        popularServices,
        totalServices: services.length,
        activeServices: services.filter(s => s.active).length
      };

      res.json(stats);
    } catch (error) {
      console.error('Get analytics stats error:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });

  // WebSocket for real-time updates
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 WebSocket client connected');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'subscribe' && message.channel) {
          console.log(`📡 Client subscribed to ${message.channel}`);
          // Store subscription info (would need proper implementation)
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
    });
  });

  console.log('🚀 Supabase routes registered successfully');
  return httpServer;
}