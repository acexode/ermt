import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from 'src/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      message: 'NextAuth test endpoint',
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          role: (session.user as any)?.role,
        }
      } : null,
      env: {
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('NextAuth test error:', error);
    return NextResponse.json({
      error: 'NextAuth test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 
