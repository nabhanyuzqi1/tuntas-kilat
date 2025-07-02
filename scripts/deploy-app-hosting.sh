#!/bin/bash

echo "🚀 Firebase App Hosting Deployment Script"

# Step 1: Build the application
echo "🔨 Building application..."
npm run build

# Step 2: Test production server locally
echo "🖥️ Testing production server..."
NODE_ENV=production PORT=8080 node dist/index.js &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
echo "🏥 Testing health endpoint..."
if curl -f http://localhost:8080/health; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    kill $SERVER_PID
    exit 1
fi

# Test API endpoint
echo "🔌 Testing API endpoint..."
if curl -f http://localhost:8080/api/services; then
    echo "✅ API endpoint working"
else
    echo "❌ API endpoint failed"
    kill $SERVER_PID
    exit 1
fi

# Kill test server
kill $SERVER_PID

echo "✅ All tests passed!"
echo "🚀 Ready for Firebase App Hosting deployment"
echo ""
echo "Next steps:"
echo "1. Ensure all environment variables are set in Firebase console"
echo "2. Run: firebase deploy --only hosting"
echo "3. Your app will be available at: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app"