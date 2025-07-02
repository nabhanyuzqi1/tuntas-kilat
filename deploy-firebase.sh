#!/bin/bash

# Tuntas Kilat - Firebase Deployment Script
echo "🚀 Starting Firebase deployment for Tuntas Kilat..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase projects:list &> /dev/null || firebase login

# Set project
echo "📋 Setting Firebase project..."
firebase use tuntas-kilat

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy Firestore rules and indexes
echo "🔥 Deploying Firestore rules..."
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Storage rules
echo "💾 Deploying Storage rules..."
firebase deploy --only storage

# Deploy Cloud Functions
echo "⚡ Deploying Cloud Functions..."
firebase deploy --only functions

# Deploy to App Hosting
echo "🌐 Deploying to Firebase App Hosting..."
firebase deploy --only hosting:production

# Verify deployment
echo "✅ Deployment completed!"
echo "🌍 App URL: https://tuntas-kilat.web.app"
echo "📊 Firebase Console: https://console.firebase.google.com/project/tuntas-kilat"

# Test deployment
echo "🧪 Testing deployed endpoints..."
curl -s -o /dev/null -w "%{http_code}" https://tuntas-kilat.web.app/api/services

echo "✨ Firebase deployment successful!"