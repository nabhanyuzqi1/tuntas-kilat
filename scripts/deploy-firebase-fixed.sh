#!/bin/bash

echo "🔧 Firebase App Hosting Deployment Fix Script"
echo "Addressing 503 Server Error and container startup issues"

# Step 1: Verify all required files exist
echo "1. Verifying deployment files..."

if [ ! -f "production-server.js" ]; then
    echo "❌ production-server.js missing"
    exit 1
fi

if [ ! -f "apphosting.yaml" ]; then
    echo "❌ apphosting.yaml missing"
    exit 1
fi

if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json missing"
    exit 1
fi

echo "✅ All deployment files present"

# Step 2: Test production server locally
echo "2. Testing production server locally..."
export NODE_ENV=production
export PORT=8080

# Start server in background
node production-server.js &
SERVER_PID=$!

sleep 5

# Test endpoints
HEALTH_TEST=$(curl -s -w "%{http_code}" http://localhost:8080/health -o /dev/null)
if [ "$HEALTH_TEST" = "200" ]; then
    echo "✅ Health check working (200)"
else
    echo "❌ Health check failed ($HEALTH_TEST)"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

API_TEST=$(curl -s -w "%{http_code}" http://localhost:8080/api/services -o /dev/null)
if [ "$API_TEST" = "200" ]; then
    echo "✅ API services working (200)"
else
    echo "❌ API services failed ($API_TEST)"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

MAIN_TEST=$(curl -s -w "%{http_code}" http://localhost:8080/ -o /dev/null)
if [ "$MAIN_TEST" = "200" ]; then
    echo "✅ Main page working (200)"
else
    echo "❌ Main page failed ($MAIN_TEST)"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

kill $SERVER_PID 2>/dev/null
echo "✅ Local testing completed successfully"

# Step 3: Create minimal Docker test (simulate Firebase container)
echo "3. Creating container simulation test..."
cat > test-container.js << 'EOF'
// Minimal container test to simulate Firebase App Hosting environment
const http = require('http');
const { spawn } = require('child_process');

console.log('🐳 Container simulation starting...');

// Set container environment
process.env.NODE_ENV = 'production';
process.env.PORT = '8080';

// Start the server process
const server = spawn('node', ['production-server.js'], {
    stdio: 'pipe',
    env: process.env
});

let serverReady = false;

server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📝 Server output:', output.trim());
    
    if (output.includes('Tuntas Kilat server running')) {
        serverReady = true;
        console.log('✅ Server started successfully');
        
        // Test health endpoint after server is ready
        setTimeout(() => {
            const req = http.get('http://localhost:8080/health', (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ Container health check passed');
                    process.exit(0);
                } else {
                    console.log('❌ Container health check failed:', res.statusCode);
                    process.exit(1);
                }
            });
            
            req.on('error', (err) => {
                console.log('❌ Container request failed:', err.message);
                process.exit(1);
            });
        }, 2000);
    }
});

server.stderr.on('data', (data) => {
    console.error('❌ Server error:', data.toString());
});

server.on('close', (code) => {
    if (code !== 0 && !serverReady) {
        console.log('❌ Server process exited with code:', code);
        process.exit(1);
    }
});

// Timeout after 30 seconds
setTimeout(() => {
    if (!serverReady) {
        console.log('❌ Container startup timeout');
        server.kill();
        process.exit(1);
    }
}, 30000);
EOF

echo "Running container simulation..."
timeout 35s node test-container.js
CONTAINER_TEST=$?

rm -f test-container.js

if [ $CONTAINER_TEST -eq 0 ]; then
    echo "✅ Container simulation passed"
else
    echo "❌ Container simulation failed"
    exit 1
fi

# Step 4: Check Firebase CLI and deploy
echo "4. Deploying to Firebase App Hosting..."

if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install: npm install -g firebase-tools"
    exit 1
fi

echo "📋 Firebase configuration:"
cat apphosting.yaml

echo ""
echo "🚀 Starting deployment..."
firebase deploy --only apphosting

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment completed!"
    echo ""
    echo "🔗 Your application should be available at:"
    echo "   https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app"
    echo ""
    echo "🧪 Test these endpoints after deployment:"
    echo "   Health: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/health"
    echo "   API: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/services"
    echo "   Main: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/"
    echo ""
    echo "⏰ Wait 2-3 minutes for container startup after deployment"
else
    echo "❌ Deployment failed. Check Firebase console for detailed logs."
    exit 1
fi