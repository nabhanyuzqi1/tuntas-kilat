# Ambon Gercep - Service-on-Demand Platform

## Overview

Ambon Gercep is a comprehensive service-on-demand platform that provides car wash, motorcycle wash, and lawn mowing services through a WhatsApp-based booking system. The application features a modern React frontend with Express.js backend, utilizing Drizzle ORM for database management and PostgreSQL for data storage.

## System Architecture

The application follows a monorepo structure with clear separation between frontend, backend, and shared components:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit's OpenID Connect authentication system
- **UI Framework**: Shadcn/ui components with Radix UI primitives and Tailwind CSS

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Real-time Communication**: WebSocket integration for live updates

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Authentication**: Passport.js with OpenID Connect strategy for Replit auth
- **Session Management**: Express sessions with PostgreSQL store
- **WebSocket**: Real-time communication for order tracking
- **API Design**: RESTful endpoints with proper error handling

### Database Schema
The application uses a comprehensive PostgreSQL schema managed by Drizzle ORM:

- **Users**: Customer and worker profiles with role-based access
- **Services**: Available services (car wash, motorcycle wash, lawn mowing)
- **Orders**: Booking system with status tracking
- **Workers**: Service provider management
- **Addresses**: Customer location management
- **Conversations**: Chat/messaging system
- **Promotions**: Discount and promotional campaign management
- **Sessions**: Authentication session storage

## Data Flow

1. **Authentication Flow**: Users authenticate through Replit's OAuth system
2. **Service Discovery**: Users browse available services with real-time pricing
3. **Booking Process**: Multi-step booking form with address validation
4. **Order Management**: Real-time order tracking with WebSocket updates
5. **Worker Assignment**: Automatic or manual worker assignment based on availability
6. **Status Updates**: Live tracking through various order states (pending → confirmed → assigned → in progress → completed)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components for accessibility
- **express**: Web application framework
- **passport**: Authentication middleware

### Development Tools
- **TypeScript**: Type safety across the entire application
- **Vite**: Fast build tool with HMR support
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### Planned Integrations
Based on the project specification in `attached_assets/GEMINI_1751407516845.md`:
- **Google Gemini API**: AI-powered customer service assistant
- **Twilio WhatsApp Business API**: WhatsApp integration for bookings
- **Google Maps API**: Location services and routing
- **Xendit Payment Gateway**: Multiple payment method support
- **Firebase**: Additional backend services (auth, storage, cloud functions)

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Development Environment
- **Development Server**: Vite dev server with HMR
- **API Development**: tsx with nodemon for auto-reload
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: ESBuild compilation to ES modules
- **Database Migrations**: Drizzle Kit for schema management
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Configuration Management
- Environment variables for database connections and authentication
- Separate configurations for development and production
- Build scripts for both frontend and backend compilation

## Changelog

Changelog:
- July 01, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.