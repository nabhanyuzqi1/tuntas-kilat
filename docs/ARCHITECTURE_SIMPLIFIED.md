# Tuntas Kilat - Simplified Architecture

## Overview
Tuntas Kilat telah disederhanakan menggunakan Firebase App Hosting sebagai backend utama, menghapus Firebase Functions untuk arsitektur yang lebih streamlined.

## Current Architecture

### Frontend
- **React 18** dengan TypeScript
- **Vite** untuk build dan development
- **Tailwind CSS** + **Shadcn/ui** untuk styling
- **React Query** untuk state management
- **Wouter** untuk routing

### Backend
- **Express.js** server dengan TypeScript
- **Firebase App Hosting** untuk deployment
- **Firebase Firestore** untuk database (primary storage)
- **WebSocket** untuk real-time features (menggantikan Realtime Database)
- **JWT Authentication** untuk user management (custom implementation)

### Key Services
1. **Authentication Service** (server/firebase-auth.ts)
   - WhatsApp OTP dengan YCloud API
   - Email/password registration
   - JWT token management

2. **Storage Service** (server/firebase-storage.ts)
   - Firestore integration
   - CRUD operations untuk semua entities

3. **AI Service** (server/gemini.ts)
   - Google Gemini integration
   - Customer service chatbot

4. **WhatsApp Service** (server/whatsapp.ts)
   - YCloud API integration
   - OTP delivery

5. **Real-time Features**
   - WebSocket untuk live updates
   - Order tracking
   - Worker location updates

## Removed Components
- ❌ Firebase Functions - diganti dengan Express.js endpoints
- ❌ Firebase Realtime Database - diganti dengan WebSocket untuk real-time features
- ❌ Firebase Storage - tidak digunakan dalam aplikasi
- ❌ PostgreSQL/Drizzle ORM - diganti dengan Firestore
- ❌ Complex deployment setup - disederhanakan dengan App Hosting

## Benefits
✅ **Single Backend Service**: Semua logic dalam Express.js server
✅ **Simplified Deployment**: Hanya App Hosting tanpa Functions
✅ **Consistent Tech Stack**: Firebase ecosystem penuh
✅ **Better Development Experience**: Satu server untuk semua endpoints
✅ **Cost Effective**: Mengurangi kompleksitas dan resource usage

## Deployment
```bash
# Build project
npm run build

# Deploy ke Firebase App Hosting
firebase deploy --only apphosting
```

## Environment Variables
All secrets managed through Firebase App Hosting:
- `JWT_SECRET`
- `YCLOUD_API_KEY`
- `YCLOUD_PHONE_NUMBER`
- `GEMINI_API_KEY`
- Firebase config variables

## API Endpoints
Complete REST API documented in `API_DOCUMENTATION.md` with 50+ endpoints covering:
- Authentication (OTP, login, register)
- Services management
- Order management
- Worker management
- Real-time features
- Admin dashboard