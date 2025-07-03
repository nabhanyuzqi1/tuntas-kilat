# Supabase Setup for Tuntas Kilat

This document provides instructions for setting up the Supabase database for the Tuntas Kilat application.

## Prerequisites

1. A Supabase account (sign up at [https://supabase.com/](https://supabase.com/))
2. A Supabase project (create one from your Supabase dashboard)

## Environment Variables

After creating your Supabase project, you need to set up the following environment variables in a `.env` file at the root of the project:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project dashboard under Project Settings > API.

## Database Schema

Based on the application code, you need to create the following tables in your Supabase database:

### 1. users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE,
  phone VARCHAR UNIQUE,
  firstName VARCHAR,
  lastName VARCHAR,
  role VARCHAR NOT NULL CHECK (role IN ('customer', 'worker', 'admin_umum', 'admin_perusahaan')),
  profileImageUrl VARCHAR,
  password VARCHAR,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. services

```sql
CREATE TABLE services (
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
```

### 3. workers

```sql
CREATE TABLE workers (
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
```

### 4. orders

```sql
CREATE TABLE orders (
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
```

### 5. addresses

```sql
CREATE TABLE addresses (
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
```

### 6. promotions

```sql
CREATE TABLE promotions (
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
```

### 7. conversations

```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  customerId UUID REFERENCES users(id),
  workerId INTEGER REFERENCES workers(id),
  orderId INTEGER REFERENCES orders(id),
  messages JSONB,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

For better security, you should set up Row Level Security policies for your tables. Here are some example policies:

### Users Table

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin can see all users
CREATE POLICY "Admins can see all users" ON users
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() IN (
    SELECT id FROM users WHERE role IN ('admin_umum', 'admin_perusahaan')
  ));

-- Users can see their own data
CREATE POLICY "Users can see own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

## Sample Data

You can insert sample data to test your application:

### Sample Services

```sql
INSERT INTO services (name, description, category, basePrice, duration, features, active)
VALUES 
('Basic Cleaning', 'Standard home cleaning service', 'Cleaning', 150000, 120, '["Dusting", "Vacuuming", "Mopping"]', true),
('Deep Cleaning', 'Thorough cleaning of all areas', 'Cleaning', 300000, 240, '["Dusting", "Vacuuming", "Mopping", "Bathroom Scrubbing", "Kitchen Deep Clean"]', true),
('Electrical Repair', 'Fix electrical issues in your home', 'Electrical', 200000, 90, '["Outlet Repair", "Switch Repair", "Wiring Check"]', true),
('Plumbing Service', 'Fix water and plumbing issues', 'Plumbing', 250000, 120, '["Leak Repair", "Drain Cleaning", "Pipe Inspection"]', true);
```

## Next Steps

After setting up your database schema:

1. Update your `.env` file with the correct Supabase credentials
2. Run the application to test the connection
3. If you encounter any issues, check the Supabase logs in your project dashboard

## How to Execute the SQL Script

We've created a SQL script `setup-supabase-tables.sql` that contains all the necessary table creation statements. To execute this script:

1. Log in to your Supabase dashboard at [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Go to the SQL Editor in the left sidebar
4. Create a new query
5. Copy and paste the contents of `setup-supabase-tables.sql` into the editor
6. Click "Run" to execute the script

Alternatively, you can run each CREATE TABLE statement individually if you prefer.

## Verifying the Setup

After executing the SQL script, you can verify that the tables were created correctly:

1. In the Supabase dashboard, go to the Table Editor in the left sidebar
2. You should see all the tables listed: users, services, workers, orders, addresses, promotions, and conversations
3. Run the `test-supabase-connection.js` script to verify the connection and table access:
   ```
   node test-supabase-connection.js
   ```

## Troubleshooting

- If you encounter CORS issues, make sure to add your application URL to the allowed origins in your Supabase project settings.
- If authentication fails, verify that your JWT secret matches the one in your Supabase project settings.
- For database query issues, check the SQL editor in your Supabase dashboard to test queries directly.
- If you get "relation does not exist" errors, make sure you've executed the SQL script to create all the tables.
- The RLS policies might cause permission issues. If you're testing, you can temporarily disable RLS for a table with `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`