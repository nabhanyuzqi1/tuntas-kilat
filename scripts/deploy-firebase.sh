#!/bin/bash

echo "🚀 Firebase App Hosting - Source Deployment"

# Step 1: Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Step 2: Verify Firebase project
echo "📋 Checking Firebase project configuration..."
if [ ! -f ".firebaserc" ]; then
    echo "❌ .firebaserc not found. Please run 'firebase init' first."
    exit 1
fi

# Step 3: Verify firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found."
    exit 1
else
    echo "✅ firebase.json configuration found"
fi

# Step 4: Test production server locally first
echo "🖥️ Testing production server locally..."
NODE_ENV=production PORT=8080 timeout 10s node production-server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
if curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Local production server health check passed"
else
    echo "❌ Local production server health check failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test API endpoint
if curl -f -s http://localhost:8080/api/services > /dev/null 2>&1; then
    echo "✅ Local production API endpoints working"
else
    echo "❌ Local production API endpoints failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Kill test server
kill $SERVER_PID 2>/dev/null

echo "✅ Local testing completed successfully"

# Step 5: Deploy to Firebase App Hosting
echo "🔥 Deploying to Firebase App Hosting..."
firebase deploy --only apphosting

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "Your application is now live at:"
    echo "https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app"
    echo ""
    echo "Test these endpoints:"
    echo "- Health: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/health"
    echo "- Services: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/services"
    echo "- Root: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/"
else
    echo "❌ Deployment failed. Check Firebase console logs for details."
    exit 1
fi