import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOrderSchema, insertServiceSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";
import { processCustomerMessage, generateOrderSummary, analyzeCustomerSentiment } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Service routes
  app.get('/api/services', async (req, res) => {
    try {
      const { category } = req.query;
      let services;
      
      if (category && typeof category === 'string') {
        services = await storage.getServicesByCategory(category);
      } else {
        services = await storage.getServices();
      }
      
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post('/api/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin_umum' && user.role !== 'admin_perusahaan')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let orders;
      
      if (user.role === 'customer') {
        orders = await storage.getOrdersByCustomer(userId);
      } else if (user.role === 'worker') {
        const worker = await storage.getWorkerByUserId(userId);
        if (worker) {
          orders = await storage.getOrdersByWorker(worker.id);
        } else {
          orders = [];
        }
      } else if (user.role === 'admin_umum' || user.role === 'admin_perusahaan') {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        orders = await storage.getOrders(limit);
      } else {
        orders = [];
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin_umum' && user.role !== 'admin_perusahaan')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const orders = await storage.getPendingOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      res.status(500).json({ message: "Failed to fetch pending orders" });
    }
  });

  app.get('/api/orders/tracking/:trackingId', async (req, res) => {
    try {
      const { trackingId } = req.params;
      const order = await storage.getOrderByTrackingId(trackingId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Generate tracking ID
      const trackingId = `AGC-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      
      const orderData = {
        ...req.body,
        customerId: userId,
        trackingId,
        timeline: [
          {
            status: 'pending',
            timestamp: new Date(),
            note: 'Order created'
          }
        ]
      };
      
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      
      // TODO: Notify via WebSocket
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status, note } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const timeline = Array.isArray(order.timeline) ? order.timeline : [];
      timeline.push({
        status,
        timestamp: new Date(),
        note: note || `Status updated to ${status}`
      });

      const updatedOrder = await storage.updateOrderStatus(orderId, status, timeline);
      
      // TODO: Notify via WebSocket
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Worker routes
  app.get('/api/workers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin_umum' && user.role !== 'admin_perusahaan')) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const workers = await storage.getWorkers();
      res.json(workers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      res.status(500).json({ message: "Failed to fetch workers" });
    }
  });

  app.get('/api/workers/available', async (req, res) => {
    try {
      const { specialization } = req.query;
      const workers = await storage.getAvailableWorkers(specialization as string);
      res.json(workers);
    } catch (error) {
      console.error("Error fetching available workers:", error);
      res.status(500).json({ message: "Failed to fetch available workers" });
    }
  });

  app.patch('/api/workers/:id/location', isAuthenticated, async (req: any, res) => {
    try {
      const workerId = parseInt(req.params.id);
      const { lat, lng } = req.body;
      
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ message: "Invalid coordinates" });
      }

      await storage.updateWorkerLocation(workerId, lat, lng);
      res.json({ message: "Location updated" });
    } catch (error) {
      console.error("Error updating worker location:", error);
      res.status(500).json({ message: "Failed to update worker location" });
    }
  });

  // Address routes
  app.get('/api/addresses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const addresses = await storage.getUserAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post('/api/addresses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const addressData = {
        ...req.body,
        userId
      };
      
      const address = await storage.createAddress(addressData);
      res.json(address);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  // Chat/Conversation routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversationByCustomer(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationData = {
        ...req.body,
        customerId: userId,
        messages: req.body.messages || []
      };
      
      const validatedData = insertConversationSchema.parse(conversationData);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { sender, content } = req.body;
      
      const message = {
        id: Date.now().toString(),
        sender,
        content,
        timestamp: new Date(),
        metadata: {}
      };
      
      // For demo purposes, add a simple AI response
      const conversation = await storage.addMessageToConversation(conversationId, message);
      
      if (sender === 'customer') {
        // AI-powered response using Gemini
        try {
          const botResponse = await processCustomerMessage(content, {
            conversationId,
            customerId: req.user.claims.sub
          });
          
          // Analyze sentiment
          const sentiment = await analyzeCustomerSentiment(content);
          
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            content: botResponse.message,
            timestamp: new Date(),
            metadata: {
              quickReplies: botResponse.quickReplies,
              bookingAction: botResponse.bookingAction,
              sentiment: sentiment,
              confidence: sentiment.confidence
            }
          };
          
          await storage.addMessageToConversation(conversationId, aiMessage);
        } catch (error) {
          console.error("Error processing AI response:", error);
          // Fallback response
          const fallbackMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            content: 'Maaf, ada gangguan teknis. Silakan coba lagi atau hubungi customer service kami di nomor WhatsApp.',
            timestamp: new Date(),
            metadata: {
              quickReplies: ['🔄 Coba Lagi', '📞 Hubungi CS'],
              isError: true
            }
          };
          
          await storage.addMessageToConversation(conversationId, fallbackMessage);
        }
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(500).json({ message: "Failed to add message" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin_umum' && user.role !== 'admin_perusahaan')) {
        return res.status(403).json({ message: "Unauthorized" });
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
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Promotion routes
  app.get('/api/promotions', async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.get('/api/promotions/:code', async (req, res) => {
    try {
      const { code } = req.params;
      const promotion = await storage.getPromotion(code);
      
      if (!promotion) {
        return res.status(404).json({ message: "Promotion not found" });
      }
      
      res.json(promotion);
    } catch (error) {
      console.error("Error fetching promotion:", error);
      res.status(500).json({ message: "Failed to fetch promotion" });
    }
  });

  // Chatbot API endpoints
  app.post('/api/chatbot/message', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const botResponse = await processCustomerMessage(message, context);
      const sentiment = await analyzeCustomerSentiment(message);
      
      res.json({
        ...botResponse,
        sentiment,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error processing chatbot message:", error);
      res.status(500).json({ 
        message: "Maaf, ada gangguan teknis. Silakan coba lagi.",
        quickReplies: ['🔄 Coba Lagi', '📞 Hubungi CS'],
        error: true
      });
    }
  });

  app.post('/api/chatbot/order-summary', isAuthenticated, async (req: any, res) => {
    try {
      const orderData = req.body;
      const summary = await generateOrderSummary(orderData);
      
      res.json({
        summary,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error generating order summary:", error);
      res.status(500).json({ 
        message: "Failed to generate order summary",
        error: true
      });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle different message types
        switch (data.type) {
          case 'join_room':
            // Join a specific room (order, user, etc.)
            (ws as any).room = data.room;
            break;
          case 'location_update':
            // Broadcast location updates
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'location_update',
                  data: data.data
                }));
              }
            });
            break;
          case 'order_update':
            // Broadcast order status updates
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'order_update',
                  data: data.data
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
