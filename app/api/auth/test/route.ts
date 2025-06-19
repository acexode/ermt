import { NextResponse } from 'next/server';
import { getCurrentUser } from 'src/lib/utils/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    return NextResponse.json({
      message: 'Custom Auth test endpoint',
      timestamp: new Date().toISOString(),
      hasUser: !!user,
      user: user ? {
        id: user.id,
        role: user.role,
      } : null,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('Custom Auth test error:', error);
    return NextResponse.json({
      error: 'Custom Auth test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 
