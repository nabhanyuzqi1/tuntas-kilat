import axios from 'axios';
import crypto from 'crypto';
import { storage } from './firebase-storage';
import { processCustomerMessage } from './gemini';

// YCloud Configuration
const YCLOUD_API_URL = 'https://api.ycloud.com/v2';
const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY;
const WHATSAPP_PHONE_NUMBER = process.env.YCLOUD_PHONE_NUMBER || '+6282256729812';

interface YCloudMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: {
    type: 'button' | 'list';
    body: {
      text: string;
    };
    action: any;
  };
}

interface WebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
    };
  };
}

export class WhatsAppService {
  private apiKey: string;
  private phoneNumber: string;

  constructor() {
    this.apiKey = YCLOUD_API_KEY;
    this.phoneNumber = WHATSAPP_PHONE_NUMBER;
  }

  // Send text message
  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const payload: YCloudMessage = {
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(
        `${YCLOUD_API_URL}/whatsapp/messages`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          }
        }
      );

      console.log('WhatsApp message sent:', response.data);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  // Send OTP via WhatsApp
  async sendOTP(to: string, otp: string): Promise<boolean> {
    const message = `🔐 Kode OTP Tuntas Kilat Anda: *${otp}*

Gunakan kode ini untuk verifikasi dalam 5 menit.
Jangan bagikan kode ini kepada siapa pun.

Salam,
Tim Tuntas Kilat 🚗🏍️🌿`;

    return await this.sendMessage(to, message);
  }

  // Send welcome message with quick replies
  async sendWelcomeMessage(to: string, userName?: string): Promise<boolean> {
    try {
      const greeting = userName ? `Halo ${userName}!` : 'Halo!';
      
      const payload: YCloudMessage = {
        to: this.formatPhoneNumber(to),
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: `${greeting} 👋

Selamat datang di Tuntas Kilat! Saya assistant AI yang siap membantu Anda dengan layanan:

🏍️ Cuci Motor - Mulai dari Rp 15.000
🚗 Cuci Mobil - Mulai dari Rp 25.000  
🌿 Potong Rumput - Mulai dari Rp 50.000

Mau pesan layanan apa hari ini?`
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: 'view_services',
                  title: '📋 Lihat Layanan'
                }
              },
              {
                type: 'reply',
                reply: {
                  id: 'check_prices',
                  title: '💰 Cek Harga'
                }
              },
              {
                type: 'reply',
                reply: {
                  id: 'track_order',
                  title: '📍 Lacak Pesanan'
                }
              }
            ]
          }
        }
      };

      const response = await axios.post(
        `${YCLOUD_API_URL}/whatsapp/messages`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Error sending welcome message:', error);
      return false;
    }
  }

  // Send order confirmation
  async sendOrderConfirmation(to: string, orderData: any): Promise<boolean> {
    const message = `✅ *Pesanan Dikonfirmasi!*

📋 *Detail Pesanan:*
• ID: #${orderData.trackingId}
• Layanan: ${orderData.serviceName}
• Waktu: ${new Date(orderData.scheduledTime).toLocaleString('id-ID')}
• Alamat: ${orderData.customerInfo.address}
• Total: Rp ${orderData.finalAmount.toLocaleString('id-ID')}

👨‍🔧 *Teknisi:* ${orderData.workerName || 'Sedang dicari...'}

📱 Pantau pesanan: https://tuntaskilat.com/tracking/${orderData.trackingId}

Terima kasih telah mempercayai Tuntas Kilat! 🙏`;

    return await this.sendMessage(to, message);
  }

  // Send status update
  async sendStatusUpdate(to: string, orderData: any, status: string): Promise<boolean> {
    const statusMessages = {
      'confirmed': '✅ Pesanan dikonfirmasi',
      'assigned': '👨‍🔧 Teknisi sedang menuju lokasi',
      'in_progress': '🔄 Layanan sedang dikerjakan',
      'completed': '✅ Layanan selesai',
      'cancelled': '❌ Pesanan dibatalkan'
    };

    const statusEmoji = {
      'confirmed': '✅',
      'assigned': '🚗',
      'in_progress': '🔄',
      'completed': '✅',
      'cancelled': '❌'
    };

    const message = `${statusEmoji[status as keyof typeof statusEmoji]} *Update Pesanan #${orderData.trackingId}*

Status: ${statusMessages[status as keyof typeof statusMessages]}

${status === 'completed' ? 
  `🎉 Terima kasih! Jangan lupa berikan rating dan review.
  
📱 Beri Rating: https://tuntaskilat.com/tracking/${orderData.trackingId}` :
  `📱 Pantau: https://tuntaskilat.com/tracking/${orderData.trackingId}`
}`;

    return await this.sendMessage(to, message);
  }

  // Process incoming webhook
  async processWebhook(webhookData: any): Promise<void> {
    try {
      console.log('Processing WhatsApp webhook:', webhookData);

      const messages = webhookData.messages || [];
      
      for (const message of messages) {
        await this.processIncomingMessage(message);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  // Process individual incoming message
  private async processIncomingMessage(message: WebhookMessage): Promise<void> {
    try {
      const phoneNumber = message.from;
      let messageText = '';
      let interactionData = null;

      // Extract message content based on type
      if (message.type === 'text' && message.text) {
        messageText = message.text.body;
      } else if (message.type === 'interactive' && message.interactive) {
        if (message.interactive.button_reply) {
          messageText = message.interactive.button_reply.title;
          interactionData = {
            type: 'button',
            id: message.interactive.button_reply.id,
            title: message.interactive.button_reply.title
          };
        } else if (message.interactive.list_reply) {
          messageText = message.interactive.list_reply.title;
          interactionData = {
            type: 'list',
            id: message.interactive.list_reply.id,
            title: message.interactive.list_reply.title
          };
        }
      }

      if (!messageText) return;

      // Get or create customer
      let customer = await storage.getUserByPhone(phoneNumber);
      if (!customer) {
        // Create new customer from WhatsApp
        customer = await storage.upsertUser({
          id: `wa_${phoneNumber.replace(/\D/g, '')}`,
          phone: phoneNumber,
          firstName: 'Customer',
          lastName: 'WhatsApp',
          role: 'customer',
          isPhoneVerified: true
        });
      }

      // Get or create conversation
      let conversations = await storage.getConversationByCustomer(customer.id);
      let conversation = conversations.find(c => c.status === 'active');
      
      if (!conversation) {
        conversation = await storage.createConversation({
          customerId: customer.id,
          messages: [],
          status: 'active'
        });
      }

      // Process with AI
      const aiResponse = await processCustomerMessage(messageText, {
        customerId: customer.id,
        conversationId: conversation.id,
        interaction: interactionData
      });

      // Send AI response
      await this.sendMessage(phoneNumber, aiResponse.message);

      // Handle booking actions
      if (aiResponse.bookingAction) {
        await this.handleBookingAction(phoneNumber, aiResponse.bookingAction);
      }

      // Update conversation
      await storage.addMessageToConversation(conversation.id, {
        id: `msg_${Date.now()}_customer`,
        sender: 'customer',
        content: messageText,
        timestamp: new Date(message.timestamp),
        interaction: interactionData
      });

      await storage.addMessageToConversation(conversation.id, {
        id: `msg_${Date.now()}_ai`,
        sender: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        quickReplies: aiResponse.quickReplies,
        bookingAction: aiResponse.bookingAction
      });

    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }

  // Handle booking actions
  private async handleBookingAction(phoneNumber: string, bookingAction: any): Promise<void> {
    switch (bookingAction.type) {
      case 'view_services':
        await this.sendServicesMenu(phoneNumber);
        break;
      case 'start_booking':
        await this.sendBookingFlow(phoneNumber, bookingAction.data);
        break;
      case 'check_order':
        await this.sendOrderStatus(phoneNumber, bookingAction.data);
        break;
    }
  }

  // Send services menu
  private async sendServicesMenu(phoneNumber: string): Promise<void> {
    try {
      const services = await storage.getServices();
      
      const payload: YCloudMessage = {
        to: this.formatPhoneNumber(phoneNumber),
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: '📋 *Pilih Layanan Tuntas Kilat*\n\nSemua layanan dikerjakan oleh teknisi berpengalaman dengan garansi kepuasan 100%!'
          },
          action: {
            button: 'Pilih Layanan',
            sections: [
              {
                title: '🚗 Layanan Kendaraan',
                rows: services.filter(s => s.category === 'vehicle').map(service => ({
                  id: `service_${service.id}`,
                  title: service.name,
                  description: `Rp ${service.basePrice.toLocaleString('id-ID')} - ${service.duration} menit`
                }))
              },
              {
                title: '🏠 Layanan Rumah',
                rows: services.filter(s => s.category === 'home').map(service => ({
                  id: `service_${service.id}`,
                  title: service.name,
                  description: `Rp ${service.basePrice.toLocaleString('id-ID')} - ${service.duration} menit`
                }))
              }
            ]
          }
        }
      };

      await axios.post(
        `${YCLOUD_API_URL}/whatsapp/messages`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          }
        }
      );
    } catch (error) {
      console.error('Error sending services menu:', error);
    }
  }

  // Send booking flow
  private async sendBookingFlow(phoneNumber: string, serviceData: any): Promise<void> {
    const message = `🎯 *Booking ${serviceData.serviceName}*

Untuk melanjutkan pemesanan, silakan:

1️⃣ Klik link berikut untuk booking online:
🔗 https://tuntaskilat.com/booking?service=${serviceData.serviceId}&phone=${encodeURIComponent(phoneNumber)}

2️⃣ Atau balas pesan ini dengan format:
📍 *Alamat lengkap*
🕐 *Waktu yang diinginkan*

Contoh:
Jl. Merdeka No. 123, Jakarta Pusat
Besok jam 10 pagi

Tim kami akan segera merespon! ⚡`;

    await this.sendMessage(phoneNumber, message);
  }

  // Send order status
  private async sendOrderStatus(phoneNumber: string, trackingData: any): Promise<void> {
    try {
      const order = await storage.getOrderByTrackingId(trackingData.trackingId);
      
      if (!order) {
        await this.sendMessage(phoneNumber, 
          `❓ Pesanan dengan ID *${trackingData.trackingId}* tidak ditemukan.\n\nSilakan periksa kembali ID pesanan Anda.`
        );
        return;
      }

      const statusMap = {
        'pending': '⏳ Menunggu konfirmasi',
        'confirmed': '✅ Dikonfirmasi',
        'assigned': '👨‍🔧 Teknisi dalam perjalanan',
        'in_progress': '🔄 Sedang dikerjakan',
        'completed': '✅ Selesai',
        'cancelled': '❌ Dibatalkan'
      };

      const message = `📊 *Status Pesanan #${order.trackingId}*

🔸 Status: ${statusMap[order.status as keyof typeof statusMap]}
🔸 Layanan: ${order.serviceName || 'Unknown Service'}
🔸 Waktu: ${new Date(order.scheduledTime).toLocaleString('id-ID')}
🔸 Total: Rp ${order.finalAmount.toLocaleString('id-ID')}

📱 Detail lengkap: https://tuntaskilat.com/tracking/${order.trackingId}`;

      await this.sendMessage(phoneNumber, message);
    } catch (error) {
      console.error('Error sending order status:', error);
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  // Format phone number for international format
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return '+' + cleaned;
  }

  // Generate OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP for verification
  async storeOTP(phoneNumber: string, otp: string): Promise<void> {
    // Store in Redis or database with 5 minute expiry
    // For now, we'll use a simple in-memory storage
    // In production, use Redis or database
    const key = `otp_${phoneNumber}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // TODO: Implement proper OTP storage with expiry
    console.log(`Storing OTP ${otp} for ${phoneNumber} until ${expiresAt}`);
  }

  // Verify OTP
  async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    // TODO: Implement proper OTP verification
    // For now, return true for demo purposes
    console.log(`Verifying OTP ${otp} for ${phoneNumber}`);
    return true;
  }
}

export const whatsAppService = new WhatsAppService();