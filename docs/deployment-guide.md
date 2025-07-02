# Tuntas Kilat - Firebase Deployment Guide

## Overview
Tuntas Kilat is optimized for Firebase ecosystem deployment using Firebase App Hosting with complete integration of Firebase services.

## Local Development Setup

### 1. Environment Configuration
Create a `.env` file in the project root:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.asia-southeast1.firebasedatabase.app

# Authentication
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters

# WhatsApp API (YCloud)
YCLOUD_API_KEY=your_ycloud_api_key_here
YCLOUD_PHONE_NUMBER=your_whatsapp_business_phone_number

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Local Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Firebase Services Architecture

### Core Services Used:
1. **Firestore Database**: Primary data storage for users, orders, services, workers
2. **Realtime Database**: Real-time features (chat, location tracking, OTP storage)
3. **Cloud Functions**: Backend automation and API endpoints
4. **Cloud Storage**: File uploads and media storage
5. **App Hosting**: Full-stack application deployment
6. **Authentication**: User authentication and authorization

### Data Flow:
- **Firestore**: Persistent data (users, orders, services)
- **Realtime DB**: Live data (chat messages, location updates, OTP)
- **Storage**: Media files (profile pictures, service images)
- **Functions**: Business logic (order assignment, notifications)

## Firebase App Hosting Deployment

### 1. Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created
- App Hosting enabled in Firebase Console

### 2. Configure Environment Variables
In Firebase Console > App Hosting > Environment Variables, add:
- `JWT_SECRET`
- `YCLOUD_API_KEY`
- `YCLOUD_PHONE_NUMBER`
- `GEMINI_API_KEY`
- All `VITE_FIREBASE_*` variables

### 3. Deploy to App Hosting
```bash
# Login to Firebase
firebase login

# Initialize App Hosting (if not done)
firebase init apphosting

# Deploy
firebase deploy --only apphosting
```

## Production Considerations

### Security:
- All secrets managed via Firebase environment variables
- No hardcoded API keys in source code
- Firebase security rules implemented
- JWT token-based authentication

### Performance:
- CDN delivery via Firebase App Hosting
- Optimized build with Vite
- Firebase connection pooling
- Real-time subscriptions for live features

### Monitoring:
- Firebase Analytics integration
- Error tracking via Firebase Crashlytics
- Performance monitoring
- Cloud Function logs

## VS Code Local Debugging

### Setup:
1. Install Firebase emulators: `firebase init emulators`
2. Start emulators: `firebase emulators:start`
3. Use local `.env` file for development
4. Connect to Firebase emulators in development mode

### Debug Configuration:
- Firestore emulator: `localhost:8080`
- Realtime Database emulator: `localhost:9000`
- Functions emulator: `localhost:5001`
- App runs on: `localhost:5000`

## Deployment Checklist

### Before Deployment:
- [ ] Environment variables configured in Firebase Console
- [ ] Firebase services enabled (Firestore, Realtime DB, Storage, Functions)
- [ ] Security rules deployed
- [ ] All secrets removed from source code
- [ ] Build successful locally

### After Deployment:
- [ ] Test authentication flow
- [ ] Verify WhatsApp API integration
- [ ] Check real-time features
- [ ] Validate order flow
- [ ] Monitor Firebase logs

## Troubleshooting

### Common Issues:
1. **Environment Variables**: Ensure all secrets are configured in Firebase Console
2. **Firebase Rules**: Deploy security rules after first deployment
3. **CORS Issues**: Configure domains in Firebase Authentication settings
4. **API Limits**: Monitor Firebase usage quotas

### Support:
- Firebase Console logs for debugging
- Cloud Function logs for backend issues
- Browser console for frontend errors
- Firebase support documentation