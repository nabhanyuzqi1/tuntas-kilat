# Firebase App Hosting Deployment Guide

## Overview

This guide covers deployment methods for Tuntas Kilat application to Firebase App Hosting, including the alternative deployment method using Firebase CLI to resolve container startup issues.

## Problem Summary

**Issue**: ERR_MODULE_NOT_FOUND for 'vite' package causing container exit status 1  
**Solution**: Use Firebase CLI source deployment method instead of automatic GitHub deployment

## Deployment Methods

### Method 1: Firebase CLI Source Deployment (Recommended)

Based on [Firebase App Hosting Alternative Deployment](https://firebase.google.com/docs/app-hosting/alt-deploy#deploy-source), this method uploads source code directly and handles build in Cloud Build.

#### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project configured: Check `.firebaserc` exists
3. Production server tested locally

#### Configuration Files

**firebase.json**:
```json
{
  "apphosting": [
    {
      "backendId": "tuntas-kilat-app",
      "rootDir": "./",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "dist",
        ".cache",
        "pglite-debug.log",
        "attached_assets",
        "docs",
        "tests"
      ]
    }
  ]
}
```

**apphosting.yaml**:
```yaml
runConfig:
  runtime: nodejs20
  build:
    - npm install
  startCommand: node production-server.js
  cpu: 1
  memoryMiB: 1024
  maxInstances: 10
  minInstances: 0
  concurrency: 100
  timeoutSeconds: 300
  env:
    - variable: NODE_ENV
      value: "production"
    - variable: PORT
      value: "8080"
```

#### Deployment Steps

1. **Test Production Server Locally**:
   ```bash
   NODE_ENV=production PORT=8080 node production-server.js
   ```

2. **Verify Endpoints**:
   ```bash
   curl http://localhost:8080/health
   curl http://localhost:8080/api/services
   ```

3. **Deploy Using Firebase CLI**:
   ```bash
   firebase deploy --only apphosting
   ```

4. **Run Automated Deployment Script**:
   ```bash
   chmod +x scripts/deploy-firebase.sh
   ./scripts/deploy-firebase.sh
   ```

### Method 2: Terraform Deployment (Advanced)

For greater control over build process and environment configuration.

### Method 3: Firebase Studio Deployment

Direct deployment from Firebase Studio interface.

## Production Server Architecture

### Key Features
- **No Vite Dependencies**: Eliminates ERR_MODULE_NOT_FOUND errors
- **Container Ready**: Binds to 0.0.0.0:8080 for Firebase App Hosting
- **Health Check**: `/health` endpoint for container monitoring
- **API Endpoints**: Complete REST API with authentication
- **Static Files**: Optional static file serving with graceful fallback

### File Structure
```
production-server.js          # Standalone production server
firebase.json                 # Firebase CLI deployment config
apphosting.yaml              # App Hosting runtime configuration
scripts/deploy-firebase.sh   # Automated deployment script
```

## Environment Variables

Ensure these are configured in Firebase Console:

### Required
- `NODE_ENV=production`
- `PORT=8080`

### Optional (for full functionality)
- `JWT_SECRET`
- `YCLOUD_API_KEY`
- `YCLOUD_PHONE_NUMBER`
- `GEMINI_API_KEY`
- Firebase configuration variables

## Testing Deployment

### Local Testing
```bash
# Test production server
NODE_ENV=production PORT=8080 node production-server.js

# Test endpoints
curl http://localhost:8080/health
curl http://localhost:8080/api/services
curl http://localhost:8080/
```

### Post-Deployment Testing
```bash
# Test deployed application
curl https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/health
curl https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/services
```

## Troubleshooting

### Common Issues

1. **Container Exit Status 1**
   - **Cause**: Module import errors (ERR_MODULE_NOT_FOUND)
   - **Solution**: Use production-server.js without Vite dependencies

2. **Build Timeout**
   - **Cause**: Complex build process with Vite
   - **Solution**: Simplified build process in apphosting.yaml

3. **503/500 Errors**
   - **Cause**: Server not binding to correct port
   - **Solution**: Verify PORT=8080 and host=0.0.0.0

### Monitoring
- Check Firebase Console → App Hosting → Logs
- Monitor container startup and health check responses
- Verify environment variables are properly set

## Success Criteria

Deployment is successful when:
- ✅ Container starts without exit errors
- ✅ Health check responds with 200 status
- ✅ API endpoints return proper data
- ✅ No ERR_MODULE_NOT_FOUND errors in logs

## Production URLs

After successful deployment:
- **Main Application**: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/
- **Health Check**: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/health
- **API Services**: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/services
- **API Authentication**: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/auth/whatsapp/send-otp