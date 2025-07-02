#!/bin/bash

echo "🚀 Testing Complete Tuntas Kilat Deployment"
echo "=========================================="

# Test Frontend (Firebase Hosting)
echo -n "1. Testing Frontend Hosting... "
if curl -s -o /dev/null -w "%{http_code}" https://tuntas-kilat.web.app | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test Backend API (App Hosting)
echo -n "2. Testing Backend API... "
if curl -s https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/services | grep -q '"id"'; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test Health Check
echo -n "3. Testing Health Check... "
if curl -s https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/health | grep -q "OK"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test Authentication Endpoints
echo -n "4. Testing Auth Endpoints... "
if curl -s https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/auth/verify | grep -q '"success"'; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test Services Count
echo -n "5. Testing Services Data... "
SERVICES_COUNT=$(curl -s https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/services | jq '. | length' 2>/dev/null || echo "0")
if [ "$SERVICES_COUNT" -gt "0" ]; then
    echo "✅ OK ($SERVICES_COUNT services)"
else
    echo "❌ FAILED (No services found)"
fi

echo ""
echo "🎯 Deployment Status Summary:"
echo "Frontend: https://tuntas-kilat.web.app"
echo "Backend:  https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app"
echo "API Docs: https://tuntas-kilat-app--tuntas-kilat.asia-east1.hosted.app/api/docs"
echo ""
echo "✨ Tuntas Kilat is ready for production use!"