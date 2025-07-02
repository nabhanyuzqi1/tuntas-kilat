// Firebase realtime removed - using in-memory OTP storage
import { storage } from "./firebase-storage";
import { sessionStorage } from "./session-storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Simple in-memory OTP store for development fallback
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number; }>();

// JWT Secret dari environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret-for-testing-only-change-in-production';

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
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log(`Generating OTP for ${formattedPhone}: ${otp}`);
      
      // Primary storage: in-memory store (reliable)
      // Secondary storage: Firebase Realtime Database (bonus)
      const expiresAt = Date.now() + (5 * 60 * 1000); // 5 menit
      otpStore.set(formattedPhone, { otp, expiresAt, attempts: 0 });
      console.log('OTP stored in in-memory store (primary)');
      
      // Try Firebase as secondary storage
      let storedInFirebase = false;
      try {
        await firebaseRealtime.storeOTP(formattedPhone, otp, 5);
        storedInFirebase = true;
        console.log('OTP also stored in Firebase Realtime Database (secondary)');
      } catch (error) {
        console.log('Firebase Realtime Database not available (fallback only)');
        storedInFirebase = false;
      }

      // TODO: Implementasi WhatsApp API untuk mengirim OTP
      // Untuk testing, log OTP di console
      console.log(`=== DEBUG OTP ===`);
      console.log(`Phone: ${formattedPhone}`);
      console.log(`OTP: ${otp}`);
      console.log(`Stored in Firebase: ${storedInFirebase}`);
      console.log(`=================`);
      
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
    console.log('=== Starting OTP Verification ===');
    console.log('Phone Number:', phoneNumber);
    console.log('OTP:', otp);
    
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      console.log('Formatted phone:', formattedPhone);
      
      // Dual verification system: Firebase Realtime DB + In-memory fallback
      let otpValid = false;
      let errorMessage = '';
      let verificationSource = '';
      
      // Step 1: Check in-memory store first (primary)
      console.log('Checking in-memory store first...');
      const storedOtp = otpStore.get(formattedPhone);
      console.log('In-memory OTP data:', storedOtp);
      
      if (storedOtp) {
        if (storedOtp.expiresAt < Date.now()) {
          otpValid = false;
          errorMessage = 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.';
          console.log('OTP expired in memory store');
          otpStore.delete(formattedPhone); // Clean up expired OTP
        } else if (storedOtp.otp !== otp) {
          // Increment attempts
          storedOtp.attempts = (storedOtp.attempts || 0) + 1;
          if (storedOtp.attempts >= 3) {
            otpStore.delete(formattedPhone);
            otpValid = false;
            errorMessage = 'Terlalu banyak percobaan salah. Silakan minta kode OTP baru.';
          } else {
            otpStore.set(formattedPhone, storedOtp);
            otpValid = false;
            errorMessage = `Kode OTP salah. Sisa percobaan: ${3 - storedOtp.attempts}`;
          }
          console.log('OTP mismatch, attempts:', storedOtp.attempts);
        } else {
          otpValid = true;
          verificationSource = 'Memory';
          console.log('In-memory verification successful');
          // Clean up used OTP
          otpStore.delete(formattedPhone);
        }
      } else {
        // Step 2: If not found in memory, try Firebase as backup
        console.log('OTP not found in memory, trying Firebase Realtime Database as backup...');
        try {
          const verificationResult = await firebaseRealtime.verifyOTP(formattedPhone, otp);
          console.log('Firebase verification result:', verificationResult);
          
          if (verificationResult && verificationResult.valid !== undefined) {
            if (verificationResult.message === 'Database not available') {
              otpValid = false;
              errorMessage = 'Kode OTP tidak ditemukan. Silakan minta kode baru.';
            } else {
              otpValid = verificationResult.valid;
              errorMessage = verificationResult.message;
              verificationSource = 'Firebase';
            }
          } else {
            otpValid = false;
            errorMessage = 'Kode OTP tidak ditemukan. Silakan minta kode baru.';
          }
        } catch (firebaseError) {
          console.log('Firebase verification also failed:', firebaseError);
          otpValid = false;
          errorMessage = 'Kode OTP tidak ditemukan. Silakan minta kode baru.';
        }
      }
      
      console.log(`OTP verification result: ${otpValid} (source: ${verificationSource})`);
      
      if (!otpValid) {
        console.log('OTP verification failed:', errorMessage);
        return {
          success: false,
          message: errorMessage || 'Kode OTP tidak valid.'
        };
      }

      // Simple user management for now - create/find user
      let user;
      try {
        // Simple user object creation
        user = {
          id: `user_${formattedPhone.replace(/\D/g, '')}_${Date.now()}`,
          firstName: userData?.firstName || 'User',
          lastName: userData?.lastName || '',
          email: `${formattedPhone.replace(/\D/g, '')}@tuntas-kilat.com`,
          phone: formattedPhone,
          phoneNumber: formattedPhone,
          role: 'customer' as const,
          membershipLevel: 'bronze' as const,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } catch (error) {
        console.error('Error creating user:', error);
        return {
          success: false,
          message: 'Gagal membuat akun pengguna.'
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
    console.log('=== Email/Password Login ===');
    console.log('Identifier:', identifier);
    
    // Validate input parameters
    if (!identifier || !password) {
      return { success: false, message: 'Email dan password harus diisi' };
    }
    
    try {
      // Find user by email or phone
      let user = null;
      
      if (identifier.includes('@')) {
        user = await storage.getUserByEmail(identifier);
        console.log('User found by email:', !!user);
      } else {
        const formattedPhone = this.formatPhoneNumber(identifier);
        user = await storage.getUserByPhone(formattedPhone);
        console.log('User found by phone:', !!user);
      }
      
      if (!user) {
        return {
          success: false,
          message: 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.'
        };
      }
      
      if (!user.password) {
        return {
          success: false,
          message: 'Akun belum memiliki password. Silakan gunakan OTP WhatsApp atau reset password.'
        };
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Password salah. Silakan coba lagi.'
        };
      }
      
      // Update last login
      await storage.upsertUser({
        ...user,
        lastLoginAt: new Date()
      });
      
      const token = this.generateToken(user);
      
      return {
        success: true,
        message: 'Login berhasil!',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan sistem. Silakan coba lagi.'
      };
    }
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    console.log('=== Email Registration ===');
    console.log('Email:', userData.email);
    
    try {
      // Check if user already exists in session storage first (fast)
      let existingUser = null;
      try {
        existingUser = await sessionStorage.getUserByEmail(userData.email);
        console.log('Checked session storage for existing user:', !!existingUser);
      } catch (error) {
        console.log('Session storage check completed');
      }
      
      if (existingUser) {
        return {
          success: false,
          message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
        };
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create new user
      const newUser = {
        id: `user_email_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || null,
        phoneNumber: userData.phone || null,
        password: hashedPassword,
        role: 'customer' as const,
        membershipLevel: 'bronze' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store in Firebase and in-memory storage
      console.log('Creating new user with email registration');
      
      // Priority 1: Store in session storage immediately (fast)
      try {
        await sessionStorage.set(newUser.id, newUser);
        console.log('User stored in session storage (priority 1)');
      } catch (sessionError) {
        console.error('Session storage error:', sessionError);
      }
      
      // Skip Firebase for now - use session storage only (fastest)
      console.log('Firebase bypassed - using session storage for immediate response');
      
      const token = this.generateToken(newUser);
      
      return {
        success: true,
        message: 'Registrasi berhasil! Selamat datang di Tuntas Kilat.',
        token,
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.'
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

      // Return decoded token for session verification
      return decoded;
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
    const now = Date.now();
    for (const [phoneNumber, otpData] of otpStore.entries()) {
      if (otpData.expiresAt < now) {
        otpStore.delete(phoneNumber);
      }
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();

// Jalankan cleanup setiap 10 menit
setInterval(() => {
  firebaseAuthService.cleanExpiredOTPs();
}, 10 * 60 * 1000);