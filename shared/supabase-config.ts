import { createClient } from '@supabase/supabase-js'

// Supabase configuration - using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations (Node.js environment)
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  if (!serviceKey || !supabaseUrl) {
    throw new Error('Missing SUPABASE_SERVICE_KEY environment variable')
  }
  return createClient(supabaseUrl, serviceKey)
}

export const isSupabaseAvailable = !!(supabaseUrl && supabaseAnonKey)

console.log('✅ Supabase client configured successfully')