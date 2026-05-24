import { clerkMiddleware, requireAuth } from '@clerk/express';

// Middleware to parse Clerk tokens and add auth state to the request
export const withClerkAuth = clerkMiddleware();

// Middleware to block unauthenticated requests completely
export const protectRoute = requireAuth();
