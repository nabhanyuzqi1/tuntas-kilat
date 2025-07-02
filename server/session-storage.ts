import { storage } from './storage-simple';

// In-memory session storage with Firebase backup
class SessionStorage {
  private sessions = new Map<string, any>();
  private readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  async set(sessionId: string, userData: any): Promise<void> {
    const sessionData = {
      ...userData,
      expiresAt: Date.now() + this.SESSION_DURATION,
      lastAccessAt: Date.now()
    };

    // Store in memory for fast access
    this.sessions.set(sessionId, sessionData);

    // Also store in Firebase for persistence
    try {
      const user = await storage.upsertUser(userData);
      console.log(`Session ${sessionId} stored for user ${user.id}`);
    } catch (error) {
      console.error('Error storing session in Firebase:', error);
    }
  }

  async get(sessionId: string): Promise<any | null> {
    // Try memory first
    let sessionData = this.sessions.get(sessionId);
    
    if (sessionData) {
      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        this.sessions.delete(sessionId);
        return null;
      }
      
      // Update last access time
      sessionData.lastAccessAt = Date.now();
      this.sessions.set(sessionId, sessionData);
      
      return sessionData;
    }

    // If not in memory, try to find user by sessionId (which could be userId)
    try {
      const user = await storage.getUser(sessionId);
      if (user) {
        const sessionData = {
          ...user,
          expiresAt: Date.now() + this.SESSION_DURATION,
          lastAccessAt: Date.now()
        };
        
        // Store back in memory for next time
        this.sessions.set(sessionId, sessionData);
        return sessionData;
      }
    } catch (error) {
      console.error('Error retrieving session from Firebase:', error);
    }

    return null;
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, sessionData] of this.sessions.entries()) {
      if (now > sessionData.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Get session by user identifier (email or phone)
  async getByIdentifier(identifier: string): Promise<any | null> {
    // Check memory first
    for (const sessionData of this.sessions.values()) {
      if (sessionData.email === identifier || sessionData.phoneNumber === identifier) {
        if (Date.now() <= sessionData.expiresAt) {
          return sessionData;
        }
      }
    }

    // Check Firebase
    try {
      let user = null;
      
      if (identifier.includes('@')) {
        user = await storage.getUserByEmail(identifier);
      } else {
        // Format phone number for search
        const formattedPhone = identifier.startsWith('+62') ? identifier : 
                              identifier.startsWith('0') ? `+62${identifier.slice(1)}` : 
                              `+62${identifier}`;
        user = await storage.getUserByPhone(formattedPhone);
      }

      if (user) {
        const sessionData = {
          ...user,
          expiresAt: Date.now() + this.SESSION_DURATION,
          lastAccessAt: Date.now()
        };
        
        // Store in memory with user ID as session ID
        this.sessions.set(user.id, sessionData);
        return sessionData;
      }
    } catch (error) {
      console.error('Error retrieving user by identifier:', error);
    }

    return null;
  }

  // Get user by email (quick method)
  async getUserByEmail(email: string): Promise<any | null> {
    for (const sessionData of this.sessions.values()) {
      if (sessionData.email === email) {
        if (Date.now() <= sessionData.expiresAt) {
          return sessionData;
        }
      }
    }
    return null;
  }

  // Get user by phone (quick method)  
  async getUserByPhone(phone: string): Promise<any | null> {
    for (const sessionData of this.sessions.values()) {
      if (sessionData.phoneNumber === phone || sessionData.phone === phone) {
        if (Date.now() <= sessionData.expiresAt) {
          return sessionData;
        }
      }
    }
    return null;
  }
}

// Export singleton instance
export const sessionStorage = new SessionStorage();

// Clean up expired sessions every hour
setInterval(() => {
  sessionStorage.cleanupExpiredSessions();
}, 60 * 60 * 1000);