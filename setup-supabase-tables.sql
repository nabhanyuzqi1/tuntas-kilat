-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE,
  phone VARCHAR UNIQUE,
  firstName VARCHAR NOT NULL,
  lastName VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('customer', 'worker', 'admin_umum', 'admin_perusahaan')),
  profileImageUrl VARCHAR,
  password VARCHAR,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  basePrice DECIMAL NOT NULL,
  duration INTEGER NOT NULL,
  features JSONB,
  active BOOLEAN DEFAULT TRUE,
  imageUrl VARCHAR,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. workers table
CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  userId UUID REFERENCES users(id),
  employeeId VARCHAR UNIQUE,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR,
  specializations JSONB,
  availability VARCHAR CHECK (availability IN ('available', 'busy', 'offline', 'on_leave')),
  location JSONB,
  averageRating DECIMAL DEFAULT 0,
  totalJobs INTEGER DEFAULT 0,
  joinDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profileImageUrl VARCHAR,
  emergencyContact VARCHAR,
  equipment JSONB,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  trackingId VARCHAR UNIQUE NOT NULL,
  customerId UUID REFERENCES users(id),
  workerId INTEGER REFERENCES workers(id),
  serviceId INTEGER REFERENCES services(id),
  status VARCHAR CHECK (status IN ('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled')),
  scheduledTime TIMESTAMP WITH TIME ZONE,
  estimatedDuration INTEGER,
  basePrice DECIMAL,
  finalAmount DECIMAL,
  customerInfo JSONB,
  notes TEXT,
  timeline JSONB,
  paymentStatus VARCHAR CHECK (paymentStatus IN ('pending', 'paid', 'failed', 'refunded')),
  rating INTEGER,
  review TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  userId UUID REFERENCES users(id),
  label VARCHAR,
  street VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  province VARCHAR NOT NULL,
  postalCode VARCHAR,
  notes TEXT,
  isDefault BOOLEAN DEFAULT FALSE,
  location JSONB,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  code VARCHAR UNIQUE NOT NULL,
  description TEXT,
  discountType VARCHAR CHECK (discountType IN ('percentage', 'fixed')),
  discountValue DECIMAL NOT NULL,
  minOrderValue DECIMAL,
  maxDiscountAmount DECIMAL,
  startDate TIMESTAMP WITH TIME ZONE,
  endDate TIMESTAMP WITH TIME ZONE,
  isActive BOOLEAN DEFAULT TRUE,
  usageLimit INTEGER,
  usageCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  customerId UUID REFERENCES users(id),
  workerId INTEGER REFERENCES workers(id),
  orderId INTEGER REFERENCES orders(id),
  messages JSONB,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data for services
INSERT INTO services (name, description, category, basePrice, duration, features, active)
VALUES 
('Basic Cleaning', 'Standard home cleaning service', 'Cleaning', 150000, 120, '["Dusting", "Vacuuming", "Mopping"]', true),
('Deep Cleaning', 'Thorough cleaning of all areas', 'Cleaning', 300000, 240, '["Dusting", "Vacuuming", "Mopping", "Bathroom Scrubbing", "Kitchen Deep Clean"]', true),
('Electrical Repair', 'Fix electrical issues in your home', 'Electrical', 200000, 90, '["Outlet Repair", "Switch Repair", "Wiring Check"]', true),
('Plumbing Service', 'Fix water and plumbing issues', 'Plumbing', 250000, 120, '["Leak Repair", "Drain Cleaning", "Pipe Inspection"]', true);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations for testing
CREATE POLICY "Allow all operations for testing" ON users
  FOR ALL USING (true);

-- Once testing is complete, you can replace with more restrictive policies:
/*
-- Admin can see all users (using service_role)
CREATE POLICY "Admins can see all users" ON users
  FOR SELECT USING (auth.role() = 'service_role');

-- Users can see their own data
CREATE POLICY "Users can see own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
*/