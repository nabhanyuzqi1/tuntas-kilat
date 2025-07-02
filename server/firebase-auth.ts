import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin'
import { storage } from './storage-simple'
import { sessionStorage } from './session-storage'
import jwt from 'jsonwebtoken'

// Check if Firebase credentials are available
const firebaseProjectId = process.env.VITE_FIREBASE_PROJECT_ID
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL

const isFirebaseConfigured = !!(firebaseProjectId && firebasePrivateKey && firebaseClientEmail)

// Initialize Firebase Admin SDK only if properly configured
if (isFirebaseConfigured && !admin.apps.length) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: firebaseProjectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: firebasePrivateKey.replace(/\\n/g, '\n'),
      client_email: firebaseClientEmail,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${firebaseClientEmail}`
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${firebaseProjectId}-default-rtdb.firebaseio.com`
    })
    
    console.log('🔥 Firebase Admin SDK initialized successfully')
  } catch (error) {
    console.warn('⚠️ Firebase Admin SDK initialization failed:', error)
  }
} else {
  console.log('⚠️ Firebase credentials not configured - Firebase Auth features disabled')
  console.log('   Add Firebase environment variables to enable cost-effective SMS authentication')
}

export class FirebaseAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'tuntas-kilat-fallback-secret-for-development-only'
  private readonly JWT_EXPIRY = '7d'

  // Verify Firebase ID token and create/update user in Supabase
  async verifyFirebaseToken(idToken: string): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    if (!isFirebaseConfigured) {
      return {
        success: false,
        message: 'Firebase Auth not configured. Please add Firebase credentials to environment variables.'
      }
    }

    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken)
      const { uid, phone_number, email, name } = decodedToken

      // Create or update user in Supabase database
      const userData = {
        id: uid,
        phone: phone_number,
        email: email,
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ').slice(1).join(' ') || '',
        role: 'customer' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const user = await storage.upsertUser(userData)

      // Generate JWT for session management
      const token = this.generateToken(user)

      // Store in session
      await sessionStorage.set(uid, user)

      return {
        success: true,
        message: 'Firebase authentication successful',
        token,
        user
      }
    } catch (error) {
      console.error('Firebase token verification error:', error)
      return {
        success: false,
        message: 'Invalid Firebase token'
      }
    }
  }

  // Generate JWT token for session management
  generateToken(user: any): string {
    return jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        phone: user.phone,
        email: user.email 
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRY }
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

  // Verify session and get user data
  async verifySession(token: string): Promise<any> {
    try {
      const decoded = this.verifyToken(token)
      if (!decoded) return null

      // Try session storage first (fast)
      let user = await sessionStorage.get(decoded.userId)
      
      // Fallback to Supabase database
      if (!user) {
        user = await storage.getUser(decoded.userId)
        if (user) {
          await sessionStorage.set(decoded.userId, user)
        }
      }

      return user
    } catch (error) {
      console.error('Session verification error:', error)
      return null
    }
  }

  // Custom phone number verification (backup if Firebase SMS is expensive)
  async sendCustomOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    // This can use YCloud or other SMS provider as backup
    // Implementation similar to existing WhatsApp OTP system
    return {
      success: false,
      message: 'Use Firebase Auth for phone verification - more cost effective'
    }
  }

  // Admin functions
  async createCustomToken(uid: string): Promise<string> {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase Auth not configured')
    }
    return await admin.auth().createCustomToken(uid)
  }

  async getUserByPhone(phoneNumber: string): Promise<any> {
    if (!isFirebaseConfigured) {
      return null
    }
    try {
      const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber)
      return userRecord
    } catch (error) {
      return null
    }
  }

  async deleteUser(uid: string): Promise<{ success: boolean; message: string }> {
    if (!isFirebaseConfigured) {
      return { success: false, message: 'Firebase Auth not configured' }
    }
    try {
      await admin.auth().deleteUser(uid)
      await sessionStorage.delete(uid)
      return { success: true, message: 'User deleted successfully' }
    } catch (error) {
      return { success: false, message: 'Failed to delete user' }
    }
  }

  // Check if Firebase is properly configured
  isConfigured(): boolean {
    return isFirebaseConfigured
  }
}

export const firebaseAuthService = new FirebaseAuthService()