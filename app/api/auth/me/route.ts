import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type AuthUser } from 'src/lib/auth-utils';
import { prisma } from 'src/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie instead of Authorization header
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(authToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Fetch complete user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return NextResponse.json({ user: authUser });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
