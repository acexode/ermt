import { getServerSession } from 'next-auth';

import { authOptions } from 'src/lib/auth';


interface SessionUser {
  id: string;
  role: string;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  if (user.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return user;
} 
