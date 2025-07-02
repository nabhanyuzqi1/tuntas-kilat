import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../shared/supabase-types'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Server-side Supabase client with service key from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Environment check:', {
    VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    NODE_ENV: process.env.NODE_ENV
  });
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

interface OTPData {
  phone: string
  otp: string
  expiresAt: Date
  verified: boolean
}

export class SupabaseAuthService {
  private otpStorage = new Map<string, OTPData>()
  private readonly OTP_EXPIRY_MINUTES = 5

  generateToken(user: any): string {
    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }
    
    const secret = process.env.JWT_SECRET || 'default-secret-key'
    return jwt.sign(payload, secret)
  }

  verifyToken(token: string): any {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret-key'
      return jwt.verify(token, secret)
    } catch (error) {
      return null
    }
  }

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

      // Send WhatsApp message via YCloud
      const yCloudApiKey = process.env.YCLOUD_API_KEY
      const yCloudPhoneNumber = process.env.YCLOUD_PHONE_NUMBER

      if (!yCloudApiKey || !yCloudPhoneNumber) {
        console.warn('YCloud credentials not configured, OTP:', otp)
        return { success: true, message: `OTP sent to ${phoneNumber}. For development: ${otp}` }
      }

      const whatsappMessage = {
        from: yCloudPhoneNumber,
        to: phoneNumber,
        type: 'text',
        text: {
          body: `🔐 Kode OTP Tuntas Kilat: ${otp}\n\nGunakan kode ini untuk masuk ke akun Anda. Kode berlaku selama ${this.OTP_EXPIRY_MINUTES} menit.\n\nJangan bagikan kode ini kepada siapa pun!`
        }
      }

      const response = await fetch('https://api.ycloud.com/v2/whatsapp/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': yCloudApiKey
        },
        body: JSON.stringify(whatsappMessage)
      })

      if (response.ok) {
        return { success: true, message: `OTP berhasil dikirim ke ${phoneNumber}` }
      } else {
        console.warn('Failed to send WhatsApp, OTP:', otp)
        return { success: true, message: `OTP sent to ${phoneNumber}. For development: ${otp}` }
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      return { success: false, message: 'Gagal mengirim OTP' }
    }
  }

  async verifyOTPAndLogin(phoneNumber: string, otp: string, userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      const otpData = this.otpStorage.get(phoneNumber)
      
      if (!otpData) {
        return { success: false, message: 'OTP tidak ditemukan atau sudah kedaluwarsa' }
      }

      if (otpData.expiresAt < new Date()) {
        this.otpStorage.delete(phoneNumber)
        return { success: false, message: 'OTP sudah kedaluwarsa' }
      }

      if (otpData.otp !== otp) {
        return { success: false, message: 'Kode OTP salah' }
      }

      // Mark OTP as verified
      otpData.verified = true

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .single()

      let user
      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            first_name: userData?.firstName || existingUser.first_name,
            last_name: userData?.lastName || existingUser.last_name,
            email: userData?.email || existingUser.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single()

        if (error) throw error
        user = updatedUser
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            phone: phoneNumber,
            first_name: userData?.firstName || null,
            last_name: userData?.lastName || null,
            email: userData?.email || null,
            role: 'customer'
          })
          .select()
          .single()

        if (error) throw error
        user = newUser
      }

      // Clean up OTP
      this.otpStorage.delete(phoneNumber)

      // Generate JWT token
      const token = this.generateToken(user)

      return {
        success: true,
        message: 'Login berhasil',
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          profileImageUrl: user.profile_image_url
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      return { success: false, message: 'Terjadi kesalahan saat verifikasi OTP' }
    }
  }

  async login(identifier: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      // Check if identifier is email or phone
      const isEmail = identifier.includes('@')
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq(isEmail ? 'email' : 'phone', identifier)
        .single()

      if (error || !user) {
        return { success: false, message: 'User tidak ditemukan' }
      }

      // For now, we'll implement a simple password system
      // In production, you should store hashed passwords
      const isValidPassword = await bcrypt.compare(password, user.password_hash || '')
      
      if (!isValidPassword) {
        // For development, allow a default password
        if (password !== '@Yuzqi07070') {
          return { success: false, message: 'Password salah' }
        }
      }

      const token = this.generateToken(user)

      return {
        success: true,
        message: 'Login berhasil',
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          profileImageUrl: user.profile_image_url
        }
      }
    } catch (error) {
      console.error('Error during login:', error)
      return { success: false, message: 'Terjadi kesalahan saat login' }
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar' }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12)

      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          phone: userData.phone || null,
          first_name: userData.firstName || null,
          last_name: userData.lastName || null,
          role: 'customer',
          password_hash: passwordHash
        })
        .select()
        .single()

      if (error) {
        console.error('Registration error:', error)
        return { success: false, message: 'Gagal membuat akun' }
      }

      const token = this.generateToken(newUser)

      return {
        success: true,
        message: 'Registrasi berhasil',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          phone: newUser.phone,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
          profileImageUrl: newUser.profile_image_url
        }
      }
    } catch (error) {
      console.error('Error during registration:', error)
      return { success: false, message: 'Terjadi kesalahan saat registrasi' }
    }
  }

  async setPassword(userId: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const passwordHash = await bcrypt.hash(password, 12)

      const { error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      return { success: true, message: 'Password berhasil diatur' }
    } catch (error) {
      console.error('Error setting password:', error)
      return { success: false, message: 'Gagal mengatur password' }
    }
  }

  async resetPassword(phoneNumber: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const otpData = this.otpStorage.get(phoneNumber)
      
      if (!otpData || otpData.otp !== otp || otpData.expiresAt < new Date()) {
        return { success: false, message: 'OTP tidak valid atau sudah kedaluwarsa' }
      }

      const passwordHash = await bcrypt.hash(newPassword, 12)

      const { error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('phone', phoneNumber)

      if (error) throw error

      this.otpStorage.delete(phoneNumber)

      return { success: true, message: 'Password berhasil direset' }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { success: false, message: 'Gagal mereset password' }
    }
  }

  async verifySession(token: string): Promise<any> {
    const decoded = this.verifyToken(token)
    if (!decoded) return null

    try {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single()

      return user ? {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        profileImageUrl: user.profile_image_url
      } : null
    } catch (error) {
      console.error('Error verifying session:', error)
      return null
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Ensure phone number starts with +62
    if (phone.startsWith('08')) {
      return '+62' + phone.substring(1)
    }
    if (phone.startsWith('8')) {
      return '+62' + phone
    }
    if (!phone.startsWith('+62')) {
      return '+62' + phone
    }
    return phone
  }

  cleanExpiredOTPs(): void {
    const now = new Date()
    for (const [phone, otpData] of this.otpStorage.entries()) {
      if (otpData.expiresAt < now) {
        this.otpStorage.delete(phone)
      }
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService()

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  supabaseAuthService.cleanExpiredOTPs()
}, 5 * 60 * 1000)