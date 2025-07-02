// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          first_name: string | null
          last_name: string | null  
          role: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan'
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          phone?: string | null
          first_name?: string | null
          last_name?: string | null
          role?: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan'
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          first_name?: string | null
          last_name?: string | null
          role?: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan'
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: number
          name: string
          description: string | null
          category: string
          base_price: number
          duration: number
          features: string[]
          active: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          category: string
          base_price: number
          duration: number
          features: string[]
          active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          category?: string
          base_price?: number
          duration?: number
          features?: string[]
          active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: number
          user_id: string
          employee_id: string
          name: string
          phone: string
          email: string | null
          specializations: string[]
          availability: 'available' | 'busy' | 'offline' | 'on_leave'
          location: unknown | null
          location_accuracy: number | null
          last_location_update: string | null
          average_rating: number
          total_jobs: number
          join_date: string
          profile_image_url: string | null
          emergency_contact: string
          equipment: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          employee_id: string
          name: string
          phone: string
          email?: string | null
          specializations: string[]
          availability?: 'available' | 'busy' | 'offline' | 'on_leave'
          location?: unknown | null
          location_accuracy?: number | null
          last_location_update?: string | null
          average_rating?: number
          total_jobs?: number
          join_date?: string
          profile_image_url?: string | null
          emergency_contact: string
          equipment: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          employee_id?: string
          name?: string
          phone?: string
          email?: string | null
          specializations?: string[]
          availability?: 'available' | 'busy' | 'offline' | 'on_leave'
          location?: unknown | null
          location_accuracy?: number | null
          last_location_update?: string | null
          average_rating?: number
          total_jobs?: number
          join_date?: string
          profile_image_url?: string | null
          emergency_contact?: string
          equipment?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          tracking_id: string
          customer_id: string
          worker_id: number | null
          service_id: number
          status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_time: string
          estimated_duration: number
          base_price: number
          final_amount: number
          promo_code: string | null
          discount: number | null
          customer_info: any
          notes: string | null
          timeline: any[]
          payment_method: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          rating: number | null
          review: string | null
          created_at: string
          updated_at: string
          assigned_at: string | null
          started_at: string | null
          completed_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: number
          tracking_id: string
          customer_id: string
          worker_id?: number | null
          service_id: number
          status?: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_time: string
          estimated_duration: number
          base_price: number
          final_amount: number
          promo_code?: string | null
          discount?: number | null
          customer_info: any
          notes?: string | null
          timeline?: any[]
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          rating?: number | null
          review?: string | null
          created_at?: string
          updated_at?: string
          assigned_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
        }
        Update: {
          id?: number
          tracking_id?: string
          customer_id?: string
          worker_id?: number | null
          service_id?: number
          status?: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_time?: string
          estimated_duration?: number
          base_price?: number
          final_amount?: number
          promo_code?: string | null
          discount?: number | null
          customer_info?: any
          notes?: string | null
          timeline?: any[]
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          rating?: number | null
          review?: string | null
          created_at?: string
          updated_at?: string
          assigned_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
        }
      }
      addresses: {
        Row: {
          id: number
          user_id: string
          address: string
          lat: number
          lng: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          address: string
          lat: number
          lng: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          address?: string
          lat?: number
          lng?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      promotions: {
        Row: {
          id: number
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount: number | null
          max_uses: number | null
          current_uses: number
          expires_at: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount?: number | null
          max_uses?: number | null
          current_uses?: number
          expires_at?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          code?: string
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_order_amount?: number | null
          max_uses?: number | null
          current_uses?: number
          expires_at?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: number
          customer_id: string
          messages: any[]
          status: 'active' | 'resolved' | 'escalated'
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          customer_id: string
          messages: any[]
          status?: 'active' | 'resolved' | 'escalated'
          last_message_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          customer_id?: string
          messages?: any[]
          status?: 'active' | 'resolved' | 'escalated'
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}