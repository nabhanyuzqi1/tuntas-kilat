import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./firebase-storage";
import type { InsertOrder, InsertService, InsertConversation } from "@shared/types";
import { z } from "zod";
import { processCustomerMessage, generateOrderSummary, analyzeCustomerSentiment } from "./gemini";
import { orderAssignmentService } from "./services/order-assignment";
import { firebaseAuthService } from "./firebase-auth";
import { whatsAppService } from "./whatsapp";

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
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Auth routes
  app.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
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
      const { identifier, password } = req.body;
      const result = await firebaseAuthService.login(identifier, password);
      res.json(result);
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = req.body;
      const result = await firebaseAuthService.register(userData);
      res.json(result);
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Registration failed' });
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
      const services = category 
        ? await storage.getServicesByCategory(category as string)
        : await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error('Error getting services:', error);
      res.status(500).json({ error: 'Failed to get services' });
    }
  });

  app.post('/api/services', authMiddleware, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
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