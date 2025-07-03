# Tuntas Kilat

Tuntas Kilat is a service marketplace application that connects customers with service providers for various home services like cleaning, repairs, and maintenance.

## Features

- User authentication (WhatsApp OTP, Email/Password)
- Service browsing and booking
- Worker management and assignment
- Order tracking and management
- Real-time updates via WebSockets
- Admin dashboard with analytics
- Chatbot support

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT + Firebase Auth
- **Real-time**: WebSockets
- **AI Features**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/tuntas-kilat.git
   cd tuntas-kilat
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables (see Environment Variables section)

4. Set up Supabase:
   - Follow the instructions in [SUPABASE-SETUP.md](SUPABASE-SETUP.md)

5. Test the Supabase connection:
   ```
   node test-supabase-connection.js
   ```

6. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

The application requires the following environment variables:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT Secret for Authentication
JWT_SECRET=your-jwt-secret

# Optional: YCloud API for WhatsApp messaging
YCLOUD_API_KEY=your-ycloud-api-key
YCLOUD_PHONE_NUMBER=your-ycloud-phone-number

# Optional: Gemini API for AI features
GEMINI_API_KEY=your-gemini-api-key

# Node Environment
NODE_ENV=development
```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express.js API
- `/shared` - Shared types and utilities
- `/docs` - Documentation files

## API Endpoints

### Authentication

- `POST /api/auth/whatsapp/send-otp` - Send OTP via WhatsApp
- `POST /api/auth/whatsapp/verify-otp` - Verify OTP and login
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password

### Services

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/category/:category` - Get services by category

### Orders

- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Workers

- `GET /api/workers` - Get all workers
- `GET /api/workers/available` - Get available workers
- `PUT /api/worker/availability` - Update worker availability
- `PUT /api/worker/location` - Update worker location

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- `users` - User accounts
- `services` - Available services
- `workers` - Service providers
- `orders` - Customer orders
- `addresses` - Customer addresses
- `promotions` - Discount promotions
- `conversations` - Chat conversations

For detailed schema information, see [SUPABASE-SETUP.md](SUPABASE-SETUP.md).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.