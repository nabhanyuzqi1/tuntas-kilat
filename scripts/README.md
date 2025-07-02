# 🚀 Tuntas Kilat Deployment Scripts

Folder ini berisi script untuk deployment dan manajemen aplikasi.

## 📁 Struktur Scripts

### Deployment Scripts (`/deployment/`)
- **deploy-firebase.sh** - Script deployment otomatis ke Firebase App Hosting
- **start-production.js** - Script startup untuk production environment

## 🔧 Cara Menggunakan Scripts

### Firebase Deployment
```bash
chmod +x scripts/deployment/deploy-firebase.sh
./scripts/deployment/deploy-firebase.sh
```

### Production Startup
```bash
node scripts/deployment/start-production.js
```

## 📋 Prerequisites

### Firebase Deployment
- Firebase CLI terinstall (`npm install -g firebase-tools`)
- Firebase project initialized (`firebase init`)
- Environment variables dikonfigurasi di `.env`

### Production Environment
- Node.js 18+ 
- Semua dependencies terinstall (`npm install`)
- Database connection terkonfigurasi

## 🌐 Environment Setup

Script deployment akan secara otomatis:
1. Build aplikasi untuk production
2. Deploy ke Firebase App Hosting
3. Konfigurasi environment variables
4. Setup Firebase services (Firestore, Authentication)

## ⚡ Quick Commands

```bash
# Deploy ke production
npm run deploy

# Start production server
npm run start:prod

# Build untuk production
npm run build
```