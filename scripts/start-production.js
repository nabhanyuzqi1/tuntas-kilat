#!/usr/bin/env node

// Simple production server for Firebase App Hosting
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check for Firebase App Hosting
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'tuntas-kilat-api',
    port: process.env.PORT || 8080
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Tuntas Kilat API Server',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'production'
  });
});

// API routes - simplified for deployment testing
app.get('/api/services', (req, res) => {
  const services = [
    {
      id: 1,
      name: "Cuci Mobil Premium",
      description: "Layanan cuci mobil lengkap dengan wax dan vacuum interior",
      category: "cuci_mobil",
      basePrice: 50000,
      duration: 60,
      features: ["Wax", "Vacuum", "Dashboard"],
      isActive: true
    },
    {
      id: 2,
      name: "Cuci Motor Express",
      description: "Cuci motor cepat dan bersih",
      category: "cuci_motor",
      basePrice: 15000,
      duration: 30,
      features: ["Sabun Premium", "Lap Microfiber"],
      isActive: true
    },
    {
      id: 3,
      name: "Potong Rumput Halaman",
      description: "Jasa potong rumput profesional untuk halaman rumah",
      category: "potong_rumput",
      basePrice: 75000,
      duration: 120,
      features: ["Peralatan Lengkap", "Rapikan Tepi"],
      isActive: true
    }
  ];
  
  res.json(services);
});

// API authentication endpoint
app.post('/api/auth/whatsapp/send-otp', (req, res) => {
  res.json({
    success: true,
    message: 'OTP akan dikirim ke WhatsApp Anda',
    demo: true
  });
});

// Serve static files if they exist
const staticPath = path.join(__dirname, '../dist/public');
try {
  app.use(express.static(staticPath));
} catch (e) {
  console.log('Static files not found, API-only mode');
}

// Fallback for SPA routes
app.get('*', (req, res) => {
  // If it's an API route that doesn't exist, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For frontend routes, try to serve index.html or return basic response
  try {
    res.sendFile(path.join(staticPath, 'index.html'));
  } catch (e) {
    res.status(200).json({
      message: 'Tuntas Kilat - Service On Demand Platform',
      api: 'Available at /api/* endpoints',
      health: 'Check at /health'
    });
  }
});

const port = process.env.PORT || 8080;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`🚀 Tuntas Kilat server running on ${host}:${port}`);
  console.log(`📍 Health check: http://${host}:${port}/health`);
  console.log(`🔌 API services: http://${host}:${port}/api/services`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});