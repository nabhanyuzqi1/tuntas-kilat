#!/bin/bash

# Tuntas Kilat - Supabase Deployment Script
echo "🚀 Deploying Tuntas Kilat to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Initialize Supabase project if not exists
if [ ! -d "supabase" ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
fi

# Login to Supabase (will prompt for access token)
echo "🔑 Logging in to Supabase..."
supabase login

# Link to existing project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref cvwqxcfcyznpnrmwfsdn

# Create production build
echo "🏗️ Building production application..."
npm run build

# Deploy database schema
echo "📊 Deploying database schema..."
supabase db push

# Deploy Edge Functions (if any)
echo "⚡ Deploying Edge Functions..."
if [ -d "supabase/functions" ]; then
    supabase functions deploy
fi

# Deploy static files to Supabase Storage
echo "📁 Deploying static files..."
supabase storage cp --recursive ./dist s3://tuntas-kilat-assets/

echo "✅ Deployment complete!"
echo "🌐 Your application is now live at: https://cvwqxcfcyznpnrmwfsdn.supabase.co"