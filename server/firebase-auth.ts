import { firebaseStorage } from "@shared/firebase-services";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface OTPStore {
  [phoneNumber: string]: {
    otp: string;
    expiresAt: Date;
    attempts: number;
  };
}

const otpStore: OTPStore = {};

// JWT Secret - in production this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-jwt-tuntas-kilat-2025";

export class FirebaseAuthService {
  generateToken(user: any): string {
    return jwt.sign(
      { 
        userId: user.id, 
        role: user.role || 'customer',
        phoneNumber: user.phoneNumber || user.phone
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Format phone number ke format Indonesia
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Simpan OTP dengan expiry 5 menit
      otpStore[formattedPhone] = {
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 menit
        attempts: 0
      };

      // Di sini akan menggunakan WhatsApp API untuk mengirim OTP
      // Untuk sementara, return success dengan OTP untuk testing
      console.log(`OTP untuk ${formattedPhone}: ${otp}`);
      
      return {
        success: true,
        message: `Kode OTP telah dikirim ke WhatsApp ${formattedPhone}`
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Gagal mengirim kode OTP. Silakan coba lagi.'
      };
    }
  }

  async verifyOTPAndLogin(phoneNumber: string, otp: string, userData?: {
    firstName?: string;
    lastName?: string;
  }): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const storedOTP = otpStore[formattedPhone];

      if (!storedOTP) {
        return {
          success: false,
          message: 'Kode OTP tidak ditemukan. Silakan minta kode baru.'
        };
      }

      if (storedOTP.expiresAt < new Date()) {
        delete otpStore[formattedPhone];
        return {
          success: false,
          message: 'Kode OTP telah kedaluwarsa. Silakan minta kode baru.'
        };
      }

      if (storedOTP.attempts >= 3) {
        delete otpStore[formattedPhone];
        return {
          success: false,
          message: 'Terlalu banyak percobaan. Silakan minta kode baru.'
        };
      }

      if (storedOTP.otp !== otp) {
        storedOTP.attempts++;
        return {
          success: false,
          message: 'Kode OTP salah. Silakan coba lagi.'
        };
      }

      // OTP valid, hapus dari store
      delete otpStore[formattedPhone];

      // Cari atau buat user di Firebase
      let user;
      try {
        // Cari user berdasarkan phone number (implementasi custom diperlukan)
        const existingUsers = await firebaseStorage.getServices(); // Placeholder
        user = null; // Sementara null, perlu implementasi pencarian user by phone
        
        if (!user && userData) {
          // Buat user baru
          const newUserData = {
            firstName: userData.firstName || 'User',
            lastName: userData.lastName || '',
            role: 'customer' as const,
            // Note: Firebase user tidak langsung support phone number
          };
          
          const userId = await firebaseStorage.createUser(newUserData);
          user = await firebaseStorage.getUser(userId);
        }
      } catch (error) {
        console.error('Error handling user in Firebase:', error);
        // Fallback: buat user object sederhana
        user = {
          id: `user_${formattedPhone.replace(/\D/g, '')}`,
          firstName: userData?.firstName || 'User',
          lastName: userData?.lastName || '',
          role: 'customer',
          phoneNumber: formattedPhone
        };
      }

      if (!user) {
        return {
          success: false,
          message: 'Gagal membuat atau menemukan akun pengguna.'
        };
      }

      const token = this.generateToken(user);

      return {
        success: true,
        message: 'Login berhasil!',
        token,
        user
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan. Silakan coba lagi.'
      };
    }
  }

  async login(identifier: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      // Firebase authentication biasanya menggunakan email/password atau phone OTP
      // Untuk sekarang, implementasi basic login
      return {
        success: false,
        message: 'Login dengan password tidak didukung. Gunakan WhatsApp OTP.'
      };
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat login.'
      };
    }
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      // Untuk Firebase, biasanya tidak menggunakan registrasi dengan password
      // Gunakan WhatsApp OTP untuk verifikasi
      return {
        success: false,
        message: 'Registrasi manual tidak didukung. Gunakan WhatsApp OTP untuk verifikasi.'
      };
    } catch (error) {
      console.error('Error during registration:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat registrasi.'
      };
    }
  }

  async setPassword(userId: string, password: string): Promise<{ success: boolean; message: string }> {
    // Firebase biasanya tidak menggunakan password storage manual
    return {
      success: false,
      message: 'Set password tidak didukung dalam sistem Firebase.'
    };
  }

  async resetPassword(phoneNumber: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // Reset password tidak relevan untuk sistem OTP
    return {
      success: false,
      message: 'Reset password tidak diperlukan. Gunakan WhatsApp OTP untuk akses.'
    };
  }

  async verifySession(token: string): Promise<any> {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) {
        return null;
      }

      // Verifikasi user masih ada di Firebase
      try {
        const user = await firebaseStorage.getUser(decoded.userId);
        return user ? decoded : null;
      } catch (error) {
        console.error('Error verifying user in Firebase:', error);
        // Return decoded token jika Firebase error (untuk fallback)
        return decoded;
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      return null;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Hapus semua karakter non-digit
    let cleaned = phone.replace(/\D/g, '');
    
    // Jika diawali dengan 0, ganti dengan 62
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    
    // Jika tidak diawali dengan 62, tambahkan 62
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return '+' + cleaned;
  }

  // Bersihkan OTP yang sudah expired
  cleanExpiredOTPs(): void {
    const now = new Date();
    for (const phoneNumber in otpStore) {
      if (otpStore[phoneNumber].expiresAt < now) {
        delete otpStore[phoneNumber];
      }
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();

// Jalankan cleanup setiap 10 menit
setInterval(() => {
  firebaseAuthService.cleanExpiredOTPs();
}, 10 * 60 * 1000);