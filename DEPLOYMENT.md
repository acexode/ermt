# Deployment Guide

## Environment Variables for Vercel

Make sure to set these environment variables in your Vercel project settings:

### Required Variables

1. **DATABASE_URL**
   - Your PostgreSQL database connection string
   - Format: `postgresql://username:password@host:port/database`

2. **JWT_SECRET**
   - A secure random string for JWT token signing
   - Generate a strong secret (at least 32 characters)
   - Example: `your-super-secret-jwt-key-change-this-in-production`

## Database Setup

1. **Prisma Migration**
   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

## Authentication Flow

The app uses a custom JWT-based authentication system with:

- **Login**: `/api/auth/login` - Creates JWT token and sets HTTP-only cookie
- **Logout**: `/api/auth/logout` - Clears the auth cookie
- **Auth Check**: `/api/auth/me` - Verifies token and returns user data
- **Sign-up**: `/api/auth/sign-up` - Creates new user account

## Protected Routes

All dashboard routes (`/home`, `/providers`, `/departments`, etc.) are protected by:
1. **Middleware** - Server-side protection using JWT token verification
2. **ProtectedRoute Component** - Client-side protection with loading states

## API Authentication

Server-side API routes use the following functions for authentication:
- `getCurrentUser()` - Returns current user from JWT token
- `requireAuth()` - Ensures user is authenticated
- `requireAdmin()` - Ensures user has admin or superadmin role
- `requireSuperAdmin()` - Ensures user has superadmin role

## Troubleshooting

### 307 Redirect Issues
- Ensure middleware paths match your route structure
- Check that environment variables are properly set
- Verify database connection is working

### Authentication Issues
- Check JWT_SECRET is set correctly
- Verify cookie settings in production
- Ensure database is accessible from Vercel

### Build Issues
- Run `npm run build` locally to check for errors
- Ensure all dependencies are properly installed
- Check TypeScript compilation with `npx tsc --noEmit`

### Token Issues
- Verify JWT_SECRET is consistent across deployments
- Check cookie domain and path settings
- Ensure HTTPS is used in production for secure cookies
