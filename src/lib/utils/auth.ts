import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { verifyToken, type AuthUser } from 'src/lib/auth-utils';

interface SessionUser {
  id: string;
  role: string;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    return null;
  }

  const payload = verifyToken(authToken);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    role: payload.role,
  };
}

export async function getCurrentUserFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const authToken = request.cookies.get('auth-token')?.value;

  if (!authToken) {
    return null;
  }

  const payload = verifyToken(authToken);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    role: payload.role,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAuthFromRequest(request: NextRequest): Promise<SessionUser> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return user;
} 
