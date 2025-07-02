import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { whatsAppService } from './whatsapp';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const OTP_EXPIRY_MINUTES = 5;

interface OTPStore {
  [phoneNumber: string]: {
    otp: string;
    expiresAt: Date;
    attempts: number;
  };
}

// In-memory OTP store (in production, use Redis)
const otpStore: OTPStore = {};

export class AuthService {
  // Generate JWT token
  generateToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Send OTP via WhatsApp
  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Check rate limiting (max 3 attempts per hour)
      const existingOtp = otpStore[formattedPhone];
      if (existingOtp && existingOtp.attempts >= 3) {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (existingOtp.expiresAt > hourAgo) {
          return {
            success: false,
            message: 'Terlalu banyak percobaan. Silakan coba lagi dalam 1 jam.'
          };
        }
      }

      // Generate OTP
      const otp = whatsAppService.generateOTP();
      
      // Store OTP
      otpStore[formattedPhone] = {
        otp,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
        attempts: (existingOtp?.attempts || 0) + 1
      };

      // Send via WhatsApp
      const sent = await whatsAppService.sendOTP(formattedPhone, otp);
      
      if (sent) {
        return {
          success: true,
          message: 'Kode OTP telah dikirim via WhatsApp'
        };
      } else {
        return {
          success: false,
          message: 'Gagal mengirim OTP. Silakan coba lagi.'
        };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan sistem'
      };
    }
  }

  // Verify OTP and login/register user
  async verifyOTPAndLogin(phoneNumber: string, otp: string, userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Check OTP
      const storedOtp = otpStore[formattedPhone];
      if (!storedOtp) {
        return {
          success: false,
          message: 'Kode OTP tidak ditemukan. Silakan minta kode baru.'
        };
      }

      if (new Date() > storedOtp.expiresAt) {
        delete otpStore[formattedPhone];
        return {
          success: false,
          message: 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.'
        };
      }

      if (storedOtp.otp !== otp) {
        return {
          success: false,
          message: 'Kode OTP salah. Silakan coba lagi.'
        };
      }

      // OTP verified, clean up
      delete otpStore[formattedPhone];

      // Get or create user
      let user = await storage.getUserByPhone(formattedPhone);
      
      if (!user) {
        // Create new user
        const newUser = await storage.upsertUser({
          id: `phone_${formattedPhone.replace(/\D/g, '')}`,
          phoneNumber: formattedPhone,
          firstName: userData?.firstName || 'User',
          lastName: userData?.lastName || '',
          email: userData?.email,
          role: 'customer',
          isPhoneVerified: true
        });
        user = newUser;

        // Send welcome message
        await whatsAppService.sendWelcomeMessage(formattedPhone, user.firstName);
      } else {
        // Update verification status
        await storage.upsertUser({
          ...user,
          isPhoneVerified: true
        });
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        success: true,
        message: 'Login berhasil',
        token,
        user
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan sistem'
      };
    }
  }

  // Login with existing credentials (for web/app)
  async login(identifier: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      // Get user by email or phone
      let user = await storage.getUserByEmail(identifier) || await storage.getUserByPhone(identifier);
      
      if (!user) {
        return {
          success: false,
          message: 'Akun tidak ditemukan'
        };
      }

      // Verify password (if user has password)
      if (user.password) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return {
            success: false,
            message: 'Password salah'
          };
        }
      } else {
        return {
          success: false,
          message: 'Silakan login dengan OTP WhatsApp'
        };
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        success: true,
        message: 'Login berhasil',
        token,
        user
      };
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan sistem'
      };
    }
  }

  // Register new user with password
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: 'customer' | 'worker';
  }): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                          await storage.getUserByPhone(userData.phone);
      
      if (existingUser) {
        return {
          success: false,
          message: 'Email atau nomor telepon sudah terdaftar'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const newUser = await storage.upsertUser({
        id: `email_${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: this.formatPhoneNumber(userData.phone),
        password: hashedPassword,
        role: userData.role || 'customer',
        isEmailVerified: false,
        isPhoneVerified: false
      });

      // Generate token
      const token = this.generateToken(newUser);

      return {
        success: true,
        message: 'Registrasi berhasil',
        token,
        user: newUser
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan sistem'
      };
    }
  }

  // Set password for existing user (from WhatsApp login)
  async setPassword(userId: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return {
          success: false,
          message: 'User tidak ditemukan'
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      await storage.upsertUser({
        ...user,
        password: hashedPassword
      });

      return {
        success: true,
        message: 'Password berhasil diatur'
      };
    } catch (error) {
      console.error('Error setting password:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan sistem'
      };
    }
  }

  // Reset password via OTP
  async resetPassword(phoneNumber: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Verify OTP
      const storedOtp = otpStore[formattedPhone];
      if (!storedOtp || storedOtp.otp !== otp || new Date() > storedOtp.expiresAt) {
        return {
          success: false,
          message: 'Kode OTP tidak valid atau sudah kadaluarsa'
        };
      }

      // Get user
      const user = await storage.getUserByPhone(formattedPhone);
      if (!user) {
        return {
          success: false,
          message: 'User tidak ditemukan'
        };
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.upsertUser({
        ...user,
        password: hashedPassword
      });

      // Clean up OTP
      delete otpStore[formattedPhone];

      return {
        success: true,
        message: 'Password berhasil direset'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan sistem'
      };
    }
  }

  // Verify session token
  async verifySession(token: string): Promise<any> {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) return null;

      const user = await storage.getUser(decoded.id);
      return user;
    } catch (error) {
      console.error('Error verifying session:', error);
      return null;
    }
  }

  // Format phone number to international format
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return '+' + cleaned;
  }

  // Clean expired OTPs (call this periodically)
  cleanExpiredOTPs(): void {
    const now = new Date();
    Object.keys(otpStore).forEach(phone => {
      if (otpStore[phone].expiresAt < now) {
        delete otpStore[phone];
      }
    });
  }
}

export const authService = new AuthService();

// Clean expired OTPs every 5 minutes
setInterval(() => {
  authService.cleanExpiredOTPs();
}, 5 * 60 * 1000);