# Tuntas Kilat - Production Deployment Guide

## Quick Start for Production

To run Tuntas Kilat in production mode with the YCloud WhatsApp integration:

### Option 1: Using Replit's Built-in Deployment
1. Click the "Deploy" button in Replit
2. Your app will be automatically deployed with all environment variables

### Option 2: Manual Production Testing
If you want to test production locally:

```bash
# Build the application
npm run build

# Run with explicit environment variables
DATABASE_URL=$DATABASE_URL \
PGHOST=$PGHOST \
PGUSER=$PGUSER \
PGPASSWORD=$PGPASSWORD \
PGDATABASE=$PGDATABASE \
NODE_ENV=production \
node dist/index.js
```

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (already configured)
- YCloud WhatsApp API credentials (already configured with API key: 78f4b7c9effd22ae86646ecf7c87f174)
- Firebase credentials (configured in environment)

## Features Ready for Production

✅ **WhatsApp OTP Authentication**
- Indonesian phone number formatting (+62xxx)
- 6-digit OTP verification via WhatsApp
- 5-minute OTP expiration with countdown timer

✅ **Multi-role Dashboard System**
- Customer dashboard for booking services
- Worker dashboard for managing orders
- Admin dashboard for platform management

✅ **YCloud.com Integration**
- Automated WhatsApp messaging
- OTP delivery system
- Order confirmations and updates

✅ **Real-time Features**
- WebSocket notifications
- Live order tracking
- Status updates across all user roles

## Authentication Flow
1. User enters Indonesian phone number (08xxx or +62xxx)
2. System sends 6-digit OTP via WhatsApp using YCloud API
3. User verifies OTP and gains access to role-based dashboard
4. JWT token authentication for subsequent requests

## Database Schema
- Complete PostgreSQL schema with users, orders, services, workers
- Automated database migrations via Drizzle ORM
- Production-ready with proper indexing and relationships

## Next Steps
Click "Deploy" in Replit to launch your production-ready WhatsApp service platform!