import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { storage } from './supabase-storage'

// Quick fix for authentication - simple in-memory auth system
interface OTPData {
  phone: string
  otp: string
  expiresAt: Date
  verified: boolean
}

class QuickAuthFix {
  private otpStorage = new Map<string, OTPData>()
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'tuntas-kilat-fallback-secret'
  private readonly OTP_EXPIRY_MINUTES = 5

  constructor() {
    // Test users are now managed in Supabase
  }

  generateToken(user: any): string {
    return jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        phone: user.phone,
        email: user.email 
      },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    )
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  async register(userData: any): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      const { email, password, firstName, lastName, phone } = userData
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar' }
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10)
      const userToInsert = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'customer' as const,
      }

      // Store user in Supabase
      const user = await storage.upsertUser(userToInsert);
      console.log(`✅ User stored in Supabase: ${email}`)

      const token = this.generateToken(user)

      return {
        success: true,
        message: 'Registrasi berhasil',
        token,
        user: { ...user, password: undefined } // Don't return password
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Gagal membuat akun' }
    }
  }

  async login(identifier: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      console.log(`🔐 Login attempt: ${identifier}`)
      
      // Find user in Supabase
      const user = identifier.includes('@')
        ? await storage.getUserByEmail(identifier)
        : await storage.getUserByPhone(identifier);

      if (!user || !user.password) {
        console.log(`❌ User not found or no password: ${identifier}`)
        return { success: false, message: 'User tidak ditemukan atau password tidak diatur' }
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        console.log(`❌ Invalid password for: ${identifier}`)
        return { success: false, message: 'Password salah' }
      }

      console.log(`✅ Login successful: ${identifier}`)
      const token = this.generateToken(user)

      return {
        success: true,
        message: 'Login berhasil',
        token,
        user: { ...user, password: undefined }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Gagal login' }
    }
  }

  async verifySession(token: string): Promise<any> {
    try {
      const decoded = this.verifyToken(token)
      if (!decoded) return null

      const user = await storage.getUser(decoded.userId);
      return user ? { ...user, password: undefined } : null
    } catch (error) {
      return null
    }
  }

  // WhatsApp OTP Methods
  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000)

      // Store OTP
      this.otpStorage.set(phoneNumber, {
        phone: phoneNumber,
        otp,
        expiresAt,
        verified: false
      })

      console.log(`📱 Generated OTP for ${phoneNumber}: ${otp} (expires at ${expiresAt.toISOString()})`)

      // Clean expired OTPs
      this.cleanExpiredOTPs()

      return {
        success: true,
        message: `Kode OTP telah dikirim ke ${phoneNumber}. Berlaku selama ${this.OTP_EXPIRY_MINUTES} menit.`
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      return { success: false, message: 'Gagal mengirim OTP' }
    }
  }

  async verifyOTPAndLogin(phoneNumber: string, otp: string, userData?: any): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      const otpData = this.otpStorage.get(phoneNumber)
      
      if (!otpData) {
        return { success: false, message: 'Kode OTP tidak ditemukan atau sudah kedaluwarsa' }
      }

      if (otpData.otp !== otp) {
        return { success: false, message: 'Kode OTP salah' }
      }

      if (new Date() > otpData.expiresAt) {
        this.otpStorage.delete(phoneNumber)
        return { success: false, message: 'Kode OTP sudah kedaluwarsa' }
      }

      // Mark OTP as verified
      otpData.verified = true

      // Find existing user or create new one
      let user = await storage.getUserByPhone(phoneNumber);
      
      if (!user) {
        // Create new user with default first and last name if not provided
        const userToInsert = {
          phone: phoneNumber,
          firstName: userData?.firstName || 'Pengguna', // Default to 'Pengguna'
          lastName: userData?.lastName || 'WhatsApp', // Default to 'WhatsApp'
          role: 'customer' as const,
        }
        user = await storage.upsertUser(userToInsert);
        console.log(`✅ New user created via WhatsApp in Supabase: ${phoneNumber}`)
      }

      // Generate token
      const token = this.generateToken(user)

      // Remove used OTP
      this.otpStorage.delete(phoneNumber)

      return {
        success: true,
        message: 'Login berhasil',
        token,
        user: { ...user, password: undefined }
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      return { success: false, message: 'Gagal memverifikasi OTP' }
    }
  }

  private cleanExpiredOTPs(): void {
    const now = new Date()
    this.otpStorage.forEach((otpData, phone) => {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(phone);
      }
    });
  }

  // Debug method
  async getAllUsers() {
    // This method would now need to query Supabase, which might not be desirable
    // for a simple debug method. It's better to query Supabase directly if needed.
    console.warn("getAllUsers is deprecated as it's no longer using in-memory data.");
    return [];
  }
}

export const quickAuthFix = new QuickAuthFix()