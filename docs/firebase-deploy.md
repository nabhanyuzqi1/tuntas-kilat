# Firebase Deployment Guide - Tuntas Kilat

## Overview
Panduan lengkap deployment aplikasi Tuntas Kilat ke Firebase App Hosting.

## Prerequisites
1. Firebase CLI sudah terinstall: `npm install -g firebase-tools`
2. Login ke Firebase: `firebase login`
3. Project Firebase "tuntas-kilat" sudah dikonfigurasi

## Environment Setup

### 1. File Service Account
File service account sudah tersedia di:
```
attached_assets/tuntas-kilat-firebase-adminsdk-fbsvc-e9194b4b51_1751421681807.json
```

### 2. Environment Variables (.env)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCG1xTF0V8dJ2o3Bh4sKqZGqNJn8h6H7M2
VITE_FIREBASE_PROJECT_ID=tuntas-kilat
VITE_FIREBASE_APP_ID=1:284752784157:web:5b8e6c8d9a4f3e2b1c7d9e
VITE_FIREBASE_AUTH_DOMAIN=tuntas-kilat.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=tuntas-kilat.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=284752784157
VITE_FIREBASE_MEASUREMENT_ID=G-MZHVJ7QKPF
VITE_FIREBASE_DATABASE_URL=https://tuntas-kilat-default-rtdb.asia-southeast1.firebasedatabase.app

# Authentication
JWT_SECRET=tuntas-kilat-super-secure-jwt-secret-key-2024-production-firebase

# WhatsApp API (YCloud)
YCLOUD_API_KEY=78f4b7c9effd22ae86646ecf7c87f174
YCLOUD_PHONE_NUMBER=+6282256729812

# Gemini AI
GEMINI_API_KEY=AIzaSyDqQvM3tKj9P7bX8cH2fY1uZ4vW9xN6aE5
```

## Build Commands

### 1. Build Application
```bash
npm run build
```

### 2. Deploy to Firebase App Hosting
```bash
firebase deploy --only hosting:production
```

### 3. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### 4. Deploy All Services
```bash
firebase deploy
```

## Project Structure

### Main Application
- `dist/public/` - Built frontend assets
- `dist/server/` - Compiled backend server
- `apphosting.yaml` - Firebase App Hosting configuration

### Firebase Services
- **Firestore Database** - Main data storage
- **Realtime Database** - Live location tracking
- **Cloud Functions** - Automated workflows
- **App Hosting** - Web application hosting
- **Storage** - File uploads and images

## Configuration Files

### apphosting.yaml
```yaml
runConfig:
  runtime: nodejs20
  name: tuntas-kilat-backend
  cpu: 1
  memoryMiB: 512
  minInstances: 0
  maxInstances: 100
  
env:
  - variable: NODE_ENV
    value: production
  - variable: FIREBASE_PROJECT_ID
    value: tuntas-kilat
  - variable: JWT_SECRET
    secret: jwt-secret
  - variable: YCLOUD_API_KEY
    secret: ycloud-api-key
  - variable: YCLOUD_PHONE_NUMBER
    secret: ycloud-phone
  - variable: GEMINI_API_KEY
    secret: gemini-api-key
```

### firebase.json
```json
{
  "hosting": [
    {
      "target": "production",
      "public": "dist/public",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "/api/**",
          "run": {
            "serviceId": "tuntas-kilat-backend",
            "region": "asia-southeast1"
          }
        },
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ],
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs20"
    }
  ],
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## Deployment Steps

### 1. Set Firebase Project
```bash
firebase use tuntas-kilat
```

### 2. Set Environment Secrets
```bash
firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set YCLOUD_API_KEY
firebase functions:secrets:set YCLOUD_PHONE_NUMBER  
firebase functions:secrets:set GEMINI_API_KEY
```

### 3. Deploy Database Rules
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 4. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### 5. Deploy App Hosting
```bash
firebase deploy --only hosting:production
```

## Post-Deployment Verification

### 1. Check Service Status
```bash
firebase hosting:channel:list
firebase functions:list
```

### 2. Test API Endpoints
```bash
curl https://tuntas-kilat.web.app/api/auth/user
curl https://tuntas-kilat.web.app/api/services
```

### 3. Monitor Logs
```bash
firebase functions:log
```

## Production URLs
- **Web App**: https://tuntas-kilat.web.app
- **Admin Panel**: https://tuntas-kilat.web.app/admin
- **API Base**: https://tuntas-kilat.web.app/api

## Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure all secrets are properly set
2. **Firestore Rules**: Check database access permissions
3. **CORS Issues**: Verify API endpoint configurations
4. **Build Errors**: Check TypeScript compilation

### Debug Commands
```bash
firebase serve --only hosting
firebase emulators:start
firebase functions:shell
```

## Monitoring & Analytics
- Firebase Console: https://console.firebase.google.com/project/tuntas-kilat
- Performance Monitoring: Enabled
- Error Reporting: Configured
- Usage Analytics: Active

## Security Notes
- All API keys stored as Firebase secrets
- Service account file secured in .gitignore
- HTTPS-only communication enforced
- JWT token authentication implemented