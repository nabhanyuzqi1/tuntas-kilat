-- Tuntas Kilat Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'worker', 'admin_umum', 'admin_perusahaan')),
  profile_image_url TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  features TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  specializations TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'offline', 'on_leave')),
  location POINT,
  location_accuracy REAL,
  last_location_update TIMESTAMPTZ,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  join_date TIMESTAMPTZ DEFAULT NOW(),
  profile_image_url TEXT,
  emergency_contact TEXT NOT NULL,
  equipment TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  tracking_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  worker_id INTEGER REFERENCES workers(id),
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled')),
  scheduled_time TIMESTAMPTZ NOT NULL,
  estimated_duration INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  promo_code TEXT,
  discount DECIMAL(10,2),
  customer_info JSONB NOT NULL,
  notes TEXT,
  timeline JSONB DEFAULT '[]',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (customer_id = auth.uid()::text);

CREATE POLICY "Workers can view assigned orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE workers.id = orders.worker_id 
      AND workers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin_umum', 'admin_perusahaan')
    )
  );

-- RLS Policies for workers
CREATE POLICY "Workers can view own profile" ON workers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Workers can update own profile" ON workers
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for addresses
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (customer_id = auth.uid()::text);

-- Insert sample data
INSERT INTO services (name, description, category, base_price, duration, features, image_url) VALUES
('Cuci Mobil Reguler', 'Cuci mobil standar dengan sabun dan wax', 'cuci_mobil', 25000, 45, ARRAY['Cuci eksterior', 'Wax pelindung', 'Vakum interior'], '/images/cuci-mobil-reguler.jpg'),
('Cuci Mobil Premium', 'Cuci mobil lengkap dengan detailing', 'cuci_mobil', 45000, 90, ARRAY['Cuci eksterior', 'Cuci interior', 'Wax premium', 'Semir ban', 'Parfum'], '/images/cuci-mobil-premium.jpg'),
('Cuci Motor Reguler', 'Cuci motor standar dengan sabun', 'cuci_motor', 15000, 30, ARRAY['Cuci eksterior', 'Lap kering', 'Semir ban'], '/images/cuci-motor-reguler.jpg'),
('Cuci Motor Premium', 'Cuci motor lengkap dengan wax', 'cuci_motor', 25000, 45, ARRAY['Cuci eksterior', 'Wax pelindung', 'Semir ban', 'Pembersih rantai'], '/images/cuci-motor-premium.jpg'),
('Potong Rumput Kecil', 'Potong rumput untuk area kecil (< 100m²)', 'potong_rumput', 35000, 60, ARRAY['Potong rumput', 'Bersih-bersih', 'Buang sampah'], '/images/potong-rumput-kecil.jpg'),
('Potong Rumput Sedang', 'Potong rumput untuk area sedang (100-300m²)', 'potong_rumput', 60000, 90, ARRAY['Potong rumput', 'Bersih-bersih', 'Buang sampah', 'Siram tanaman'], '/images/potong-rumput-sedang.jpg'),
('Potong Rumput Besar', 'Potong rumput untuk area besar (> 300m²)', 'potong_rumput', 100000, 120, ARRAY['Potong rumput', 'Bersih-bersih', 'Buang sampah', 'Siram tanaman', 'Rapikan tanaman'], '/images/potong-rumput-besar.jpg')
ON CONFLICT (name) DO NOTHING;

-- Insert sample promotions
INSERT INTO promotions (code, discount_type, discount_value, min_order_amount, max_uses, expires_at) VALUES
('FIRST10', 'percentage', 10, 20000, 100, NOW() + INTERVAL '30 days'),
('WELCOME5K', 'fixed', 5000, 25000, 50, NOW() + INTERVAL '7 days'),
('CUCI2GET1', 'percentage', 25, 50000, NULL, NOW() + INTERVAL '14 days')
ON CONFLICT (code) DO NOTHING;

-- Create sample admin user (password: @Yuzqi07070)
INSERT INTO users (id, email, phone, first_name, last_name, role, password_hash) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@tuntaskilat.com', '+6281234567890', 'Admin', 'Tuntas Kilat', 'admin_perusahaan', '$2a$12$LQv3c1yqBwlVHpPjrCheX.U5nLfY.Bl6G6Y3VjQqF8FLKJnc6qT2q')
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_worker_id ON orders(worker_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_availability ON workers(availability);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();