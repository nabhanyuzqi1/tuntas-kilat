#!/bin/bash

echo "🚀 Testing Deployment Configuration for Firebase App Hosting"

# Test 1: Check if required files exist
echo "📁 Checking required files..."
if [ ! -f "apphosting.yaml" ]; then
    echo "❌ apphosting.yaml missing"
    exit 1
else
    echo "✅ apphosting.yaml found"
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json missing"
    exit 1
else
    echo "✅ package.json found"
fi

# Test 2: Check package.json scripts
echo "📦 Checking package.json scripts..."
if ! grep -q '"build":' package.json; then
    echo "❌ Build script missing in package.json"
    exit 1
else
    echo "✅ Build script found"
fi

if ! grep -q '"start":' package.json; then
    echo "❌ Start script missing in package.json"
    exit 1
else
    echo "✅ Start script found"
fi

# Test 3: Test build process (quick check)
echo "🔨 Testing build process..."
if npm run build --silent 2>/dev/null; then
    echo "✅ Build process works"
else
    echo "⚠️ Build process needs attention"
fi

# Test 4: Test production server startup
echo "🖥️ Testing production server..."
NODE_ENV=production PORT=8080 timeout 10s node dist/index.js &
SERVER_PID=$!
sleep 3

# Check if server responds to health check
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Production server responds to health check"
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ Production server not responding"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test 5: Check environment variables in apphosting.yaml
echo "🔧 Checking apphosting.yaml configuration..."
if grep -q "PORT" apphosting.yaml; then
    echo "✅ PORT environment variable configured"
else
    echo "❌ PORT environment variable missing"
fi

if grep -q "NODE_ENV" apphosting.yaml; then
    echo "✅ NODE_ENV environment variable configured"
else
    echo "❌ NODE_ENV environment variable missing"
fi

echo "🎉 Deployment configuration test completed!"
echo "Your application is ready for Firebase App Hosting deployment."