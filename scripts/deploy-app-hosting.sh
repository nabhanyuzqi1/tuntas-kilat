#!/bin/bash

echo "🚀 Deploying App Hosting with Frontend Integration"
echo "================================================="

# Deploy to App Hosting
echo "📦 Deploying backend to App Hosting..."
firebase deploy --only apphosting:backend:tuntas-kilat-app --timeout 60s

# Test deployment
echo "🧪 Testing deployment..."
sleep 5

echo -n "Testing health endpoint... "
if curl -s https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/health | grep -q "healthy"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo -n "Testing frontend... "
if curl -s https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/ | grep -q "Tuntas Kilat"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo -n "Testing API... "
if curl -s https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/services | grep -q "id"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo ""
echo "🎯 Deployment Complete!"
echo "Frontend: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app"
echo "API: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api"
echo "Health: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/health"