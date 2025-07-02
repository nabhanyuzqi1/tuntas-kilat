import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Quick fix for authentication - simple in-memory auth system
interface OTPData {
  phone: string
  otp: string
  expiresAt: Date
  verified: boolean
}

class QuickAuthFix {
  private users = new Map<string, any>()
  private otpStorage = new Map<string, OTPData>()
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'tuntas-kilat-fallback-secret'
  private readonly OTP_EXPIRY_MINUTES = 5

  constructor() {
    this.initializeTestUsers()
  }

  private async initializeTestUsers() {
    const testUsers = [
      {
        id: 'admin-company-1',
        email: 'nabhanyuzqi1@gmail.com',
        password: '@Yuzqi07070',
        firstName: 'Admin',
        lastName: 'Perusahaan',
        phone: '085950202227',
        role: 'admin_perusahaan'
      },
      {
        id: 'admin-general-1', 
        email: 'nabhanyuzqi2@gmail.com',
        password: '@Yuzqi07070',
        firstName: 'Admin',
        lastName: 'Umum',
        phone: '085950202228',
        role: 'admin_umum'
      },
      {
        id: 'worker-1',
        email: 'nabhanyuzqi3@gmail.com', 
        password: '@Yuzqi07070',
        firstName: 'Worker',
        lastName: 'Test',
        phone: '085950202229',
        role: 'worker'
      },
      {
        id: 'customer-1',
        email: 'customer@tuntaskilat.com',
        password: '@Yuzqi07070', 
        firstName: 'Customer',
        lastName: 'Test',
        phone: '085950202230',
        role: 'customer'
      }
    ]

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const user = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      this.users.set(user.id, user)
      console.log(`✅ Test user initialized: ${user.email} (${user.role})`)
    }
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
      const existingUser = Array.from(this.users.values()).find(u => u.email === email)
      if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar' }
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = {
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store user
      this.users.set(user.id, user)
      console.log(`✅ User stored with password hash: ${email}`)

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
      
      // Find user
      const user = Array.from(this.users.values()).find(u => 
        u.email === identifier || u.phone === identifier
      )

      if (!user) {
        console.log(`❌ User not found: ${identifier}`)
        return { success: false, message: 'User tidak ditemukan' }
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

      const user = this.users.get(decoded.userId)
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
      let user = Array.from(this.users.values()).find(u => u.phone === phoneNumber)
      
      if (!user) {
        // Create new user
        const userId = `user-${Date.now()}`
        user = {
          id: userId,
          phone: phoneNumber,
          firstName: userData?.firstName || 'Customer',
          lastName: userData?.lastName || '',
          role: 'customer',
          createdAt: new Date().toISOString()
        }
        this.users.set(userId, user)
        console.log(`✅ New user created via WhatsApp: ${phoneNumber}`)
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
    for (const [phone, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(phone)
      }
    }
  }

  // Debug method
  getAllUsers() {
    return Array.from(this.users.values()).map(u => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      hasPassword: !!u.password
    }))
  }
}

export const quickAuthFix = new QuickAuthFix()