# RetailFlow - Inventory Management System with POS

## Overview

RetailFlow is a comprehensive inventory management system with point-of-sale (POS) functionality built for retail businesses. The application provides complete product lifecycle management, stock tracking, sales processing, customer management, and detailed analytics reporting. It features a modern React frontend with shadcn/ui components, a robust Node.js/Express backend, and PostgreSQL database with Drizzle ORM for type-safe database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using functional components and hooks
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Chart.js with react-chartjs-2 for data visualization
- **Forms**: React Hook Form with Zod validation resolvers
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Authorization**: Role-based access control (Admin, Manager, Cashier)
- **API Design**: RESTful API with structured error handling
- **Validation**: Zod schemas for request/response validation
- **Session Management**: Express sessions with PostgreSQL session store

### Database Architecture
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema changes
- **Connection**: Neon Database serverless PostgreSQL
- **Data Models**: Comprehensive schema covering products, categories, suppliers, customers, sales, stock movements, and purchase orders

### Key Architectural Decisions

**Monorepo Structure**: The application uses a monorepo with shared types and schemas between frontend and backend, ensuring type safety across the entire stack.

**Shared Schema Definition**: Database schemas and TypeScript types are defined once in the `shared/schema.ts` file using Drizzle ORM, providing consistent data models throughout the application.

**Component-Based UI**: The frontend follows a component-based architecture with reusable UI components from shadcn/ui, enabling consistent design and faster development.

**Server-Side Rendering Ready**: The Vite configuration and project structure support both client-side and potential server-side rendering scenarios.

**Role-Based Access Control**: The system implements granular permission controls with middleware-based authentication and role checking.

**Real-Time POS Operations**: The POS system is designed for touch-screen optimization with real-time cart updates and barcode scanner support.

**Comprehensive Reporting**: The dashboard and reporting system provides multiple time-range analytics with exportable reports in CSV format.

**Multi-Warehouse Support**: The architecture supports multiple warehouse locations and stock transfers between locations.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Authentication & Security
- **bcrypt**: Password hashing and verification
- **jsonwebtoken**: JWT token generation and verification

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with performance optimization
- **@hookform/resolvers**: Form validation resolvers for Zod schemas
- **wouter**: Lightweight routing library
- **chart.js**: Chart rendering for analytics dashboards
- **date-fns**: Date manipulation and formatting

### UI Component Libraries
- **@radix-ui/***: Headless UI primitives for accessibility
- **shadcn/ui**: Pre-built components based on Radix UI
- **lucide-react**: Icon library with consistent design
- **class-variance-authority**: Utility for component variant styling
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production builds

### Optional Integrations
- **Replit**: Development environment integration with error overlays and cartographer
- **Barcode Scanner API**: Browser-based barcode scanning for POS operations
- **Printer API**: Receipt printing capabilities for completed sales