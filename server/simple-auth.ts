import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { storage } from './storage-simple'

interface OTPData {
  phone: string
  otp: string
  expiresAt: Date
  verified: boolean
}

class SimpleAuthService {
  private otpStorage = new Map<string, OTPData>()
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'tuntas-kilat-fallback-secret'
  private readonly OTP_EXPIRY_MINUTES = 5

  // Generate JWT token
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

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  // Send OTP (mock implementation using YCloud)
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

      // Clean expired OTPs
      this.cleanExpiredOTPs()

      // Mock YCloud API call (using environment variable)
      const response = await fetch('https://api.ycloud.com/v2/whatsapp/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.YCLOUD_API_KEY || ''
        },
        body: JSON.stringify({
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'otp_verification',
            language: { code: 'id' },
            components: [{
              type: 'body',
              parameters: [{ type: 'text', text: otp }]
            }]
          }
        })
      })

      return {
        success: true,
        message: `OTP berhasil dikirim ke ${phoneNumber}`
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      return {
        success: false,
        message: 'Gagal mengirim OTP'
      }
    }
  }

  // Verify OTP and login
  async verifyOTPAndLogin(phoneNumber: string, otp: string, userData?: any): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      const otpData = this.otpStorage.get(phoneNumber)
      
      if (!otpData) {
        return { success: false, message: 'OTP tidak ditemukan atau sudah kadaluarsa' }
      }

      if (otpData.expiresAt < new Date()) {
        this.otpStorage.delete(phoneNumber)
        return { success: false, message: 'OTP sudah kadaluarsa' }
      }

      if (otpData.otp !== otp) {
        return { success: false, message: 'Kode OTP salah' }
      }

      // Mark as verified
      otpData.verified = true

      // Create or get user
      let user = await storage.getUserByPhone(phoneNumber)
      if (!user && userData) {
        user = await storage.upsertUser({
          phone: phoneNumber,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: 'customer'
        })
      }

      if (!user) {
        return { success: false, message: 'User tidak ditemukan' }
      }

      // Generate token
      const token = this.generateToken(user)

      // Clean up OTP
      this.otpStorage.delete(phoneNumber)

      return {
        success: true,
        message: 'Login berhasil',
        token,
        user
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      return { success: false, message: 'Gagal verifikasi OTP' }
    }
  }

  // Email registration
  async register(userData: any): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      const { email, password, firstName, lastName, phone } = userData
      console.log('📝 Registration attempt:', { email, hasPassword: !!password })

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email)
      if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar' }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      console.log('🔒 Password hashed, length:', hashedPassword.length)

      // Create user
      const user = await storage.upsertUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'customer'
      })
      
      console.log('👤 User created with password field:', !!user.password)

      const token = this.generateToken(user)

      return {
        success: true,
        message: 'Registrasi berhasil',
        token,
        user
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Gagal membuat akun' }
    }
  }

  // Email login
  async login(identifier: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      console.log('🔍 Login attempt for:', identifier)
      
      // Find user by email or phone
      let user = await storage.getUserByEmail(identifier)
      console.log('📧 getUserByEmail result:', user ? 'Found' : 'Not found')
      
      if (!user) {
        user = await storage.getUserByPhone(identifier)
        console.log('📱 getUserByPhone result:', user ? 'Found' : 'Not found')
      }

      if (!user) {
        console.log('❌ No user found with identifier:', identifier)
        return { success: false, message: 'User tidak ditemukan' }
      }

      if (!user.password) {
        return { success: false, message: 'Password tidak ditemukan untuk user ini' }
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return { success: false, message: 'Password salah' }
      }

      const token = this.generateToken(user)

      return {
        success: true,
        message: 'Login berhasil',
        token,
        user
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Gagal login' }
    }
  }

  // Verify session
  async verifySession(token: string): Promise<any> {
    try {
      const decoded = this.verifyToken(token)
      if (!decoded) return null

      const user = await storage.getUser(decoded.userId)
      return user
    } catch (error) {
      return null
    }
  }

  // Clean expired OTPs
  private cleanExpiredOTPs(): void {
    const now = new Date()
    for (const [phone, otpData] of this.otpStorage.entries()) {
      if (otpData.expiresAt < now) {
        this.otpStorage.delete(phone)
      }
    }
  }
}

export const simpleAuthService = new SimpleAuthService()