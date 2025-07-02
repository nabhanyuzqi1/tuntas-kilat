# Tuntas Kilat API Documentation

## Overview
Dokumentasi lengkap API endpoints untuk platform Tuntas Kilat - layanan on-demand untuk cuci mobil, cuci motor, dan potong rumput.

**Base URL**: `http://localhost:5000`  
**Production URL**: `https://tuntas-kilat.web.app`

---

## 🔐 Authentication Endpoints

### 1. WhatsApp OTP Authentication

#### Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "081234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Kode OTP telah dikirim ke WhatsApp +6281234567890"
}
```

#### Verify OTP & Login
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "081234567890",
  "otp": "123456",
  "userData": {
    "firstName": "Ahmad",
    "lastName": "Santoso"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_6281234567890_1751431744839",
    "firstName": "Ahmad",
    "lastName": "Santoso",
    "email": "6281234567890@tuntas-kilat.com",
    "phone": "+6281234567890",
    "role": "customer"
  }
}
```

### 2. Email/Password Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Ahmad",
  "lastName": "Santoso",
  "email": "ahmad@example.com",
  "phone": "081234567890",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registrasi berhasil! Selamat datang di Tuntas Kilat.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_email_1751432288973_7a6wx5zmmz",
    "firstName": "Ahmad",
    "lastName": "Santoso",
    "email": "ahmad@example.com",
    "phone": "081234567890",
    "role": "customer"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "ahmad@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_email_1751432288973_7a6wx5zmmz",
    "firstName": "Ahmad",
    "lastName": "Santoso",
    "email": "ahmad@example.com",
    "role": "customer"
  }
}
```

### 3. User Profile

#### Get User Profile
```
GET /api/auth/user
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user_6281234567890_1751431744839",
  "firstName": "Ahmad",
  "lastName": "Santoso",
  "email": "ahmad@example.com",
  "phoneNumber": "+6281234567890",
  "role": "customer",
  "membershipLevel": "bronze",
  "isActive": true,
  "createdAt": "2025-07-02T04:49:04.839Z",
  "updatedAt": "2025-07-02T04:49:04.839Z"
}
```

---

## 🏠 Services Endpoints

### Get All Services
```
GET /api/services
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cuci Mobil Premium",
      "description": "Layanan cuci mobil lengkap dengan wax dan vacuum interior",
      "category": "cuci_mobil",
      "basePrice": "50000",
      "duration": 60,
      "features": ["Wax", "Vacuum", "Dashboard"],
      "isActive": true,
      "imageUrl": "/images/cuci-mobil.jpg"
    },
    {
      "id": 2,
      "name": "Cuci Motor Express",
      "description": "Cuci motor cepat dan bersih",
      "category": "cuci_motor",
      "basePrice": "15000",
      "duration": 30,
      "features": ["Sabun Premium", "Lap Microfiber"],
      "isActive": true,
      "imageUrl": "/images/cuci-motor.jpg"
    },
    {
      "id": 3,
      "name": "Potong Rumput Halaman",
      "description": "Jasa potong rumput profesional untuk halaman rumah",
      "category": "potong_rumput",
      "basePrice": "75000",
      "duration": 120,
      "features": ["Peralatan Lengkap", "Rapikan Tepi"],
      "isActive": true,
      "imageUrl": "/images/potong-rumput.jpg"
    }
  ]
}
```

### Get Service by ID
```
GET /api/services/:id
```

### Get Services by Category
```
GET /api/services/category/:category
```

---

## 📋 Orders Endpoints

### Create Order
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": 1,
  "addressId": 1,
  "scheduledTime": "2025-07-02T10:00:00.000Z",
  "notes": "Mohon datang tepat waktu"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "trackingId": "TK20250702001",
    "customerId": "user_6281234567890_1751431744839",
    "serviceId": 1,
    "status": "pending",
    "scheduledTime": "2025-07-02T10:00:00.000Z",
    "basePrice": "50000",
    "finalAmount": "50000",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2025-07-02T04:49:04.839Z",
        "message": "Pesanan dibuat"
      }
    ]
  }
}
```

### Get All Orders (Customer)
```
GET /api/orders
Authorization: Bearer <token>
```

### Get Order by Tracking ID
```
GET /api/orders/track/:trackingId
```

### Update Order Status
```
PATCH /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "message": "Pesanan dikonfirmasi"
}
```

---

## 👷 Worker Endpoints

### Get Available Workers
```
GET /api/workers/available
Authorization: Bearer <token>
```

### Update Worker Location
```
POST /api/workers/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "lat": -6.2088,
  "lng": 106.8456,
  "accuracy": 10
}
```

### Get Worker Orders
```
GET /api/workers/orders
Authorization: Bearer <token>
```

---

## 🎯 Admin Endpoints

### Get All Orders (Admin)
```
GET /api/admin/orders
Authorization: Bearer <token>
```

### Assign Order to Worker
```
POST /api/admin/orders/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "workerId": 1
}
```

### Get Order Statistics
```
GET /api/admin/stats/orders
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 156,
  "pending": 12,
  "completed": 134,
  "cancelled": 10,
  "revenue": "7800000"
}
```

---

## 💬 Chat & Support Endpoints

### Send Chat Message
```
POST /api/chat/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "conv_123",
  "message": "Kapan pekerja akan datang?",
  "messageType": "text"
}
```

### AI Chatbot Response
```
POST /api/chatbot/message
Content-Type: application/json

{
  "message": "Saya ingin booking cuci mobil",
  "context": {
    "userId": "user_123"
  }
}
```

**Response:**
```json
{
  "message": "Baik, saya akan membantu Anda booking cuci mobil. Silakan pilih paket yang diinginkan:",
  "quickReplies": ["Cuci Mobil Premium", "Cuci Mobil Express", "Lihat Harga"],
  "bookingAction": {
    "type": "view_services",
    "data": {
      "category": "cuci_mobil"
    }
  }
}
```

---

## 🎁 Promotions Endpoints

### Get Active Promotions
```
GET /api/promotions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "WELCOME50",
      "name": "Diskon Pelanggan Baru",
      "description": "Diskon 50% untuk pelanggan baru",
      "discountType": "percentage",
      "discountValue": 50,
      "minOrderAmount": "25000",
      "validUntil": "2025-12-31T23:59:59.000Z",
      "usageLimit": 1,
      "isActive": true
    }
  ]
}
```

### Validate Promotion Code
```
POST /api/promotions/validate
Content-Type: application/json

{
  "code": "WELCOME50",
  "orderAmount": "50000"
}
```

---

## 📊 Real-time WebSocket Events

### Connection
```
ws://localhost:5000
```

### Events

#### Order Status Updates
```json
{
  "type": "orderUpdate",
  "data": {
    "orderId": 1,
    "status": "confirmed",
    "message": "Pekerja sedang dalam perjalanan",
    "estimatedArrival": "2025-07-02T10:30:00.000Z"
  }
}
```

#### Worker Location Updates
```json
{
  "type": "workerLocation",
  "data": {
    "workerId": 5,
    "orderId": 1,
    "lat": -6.2088,
    "lng": 106.8456,
    "timestamp": "2025-07-02T10:15:00.000Z"
  }
}
```

#### Chat Messages
```json
{
  "type": "chatMessage",
  "data": {
    "conversationId": "conv_123",
    "senderId": "worker_5",
    "senderType": "worker",
    "content": "Saya sudah sampai di lokasi",
    "timestamp": 1751432288973
  }
}
```

---

## 🔧 Status & Health Endpoints

### API Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-02T04:49:04.839Z",
  "services": {
    "database": "connected",
    "firebase": "connected",
    "gemini": "available"
  }
}
```

### Authentication Status
```
GET /api/auth/status
Authorization: Bearer <token>
```

---

## 📱 Mobile App Endpoints

### Get App Configuration
```
GET /api/mobile/config
```

### Push Notification Registration
```
POST /api/mobile/register-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "fcmToken": "firebase_token_here",
  "platform": "android"
}
```

---

## ⚠️ Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized (Invalid/Missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🔑 Authentication
Semua endpoint yang memerlukan autentikasi harus menyertakan token JWT di header:

```
Authorization: Bearer <your_jwt_token>
```

Token berlaku selama 7 hari dan akan otomatis diperpanjang saat digunakan.

---

## 📞 Rate Limiting
- WhatsApp OTP: Maximum 3 requests per 5 menit per nomor telepon
- API Calls: Maximum 100 requests per menit per IP
- WebSocket: Maximum 50 connections per IP

---

## 🌐 CORS & Security
API mendukung CORS untuk domain:
- `https://tuntas-kilat.web.app`
- `http://localhost:3000` (development)
- `http://localhost:5000` (development)

Semua endpoint menggunakan HTTPS di production dan dilindungi dengan Firebase Security Rules.