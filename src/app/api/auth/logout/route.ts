import { NextResponse } from 'next/server';
import { AuthError, AuthService } from '@/services/auth';

export async function POST() {
  try {
    const authService = AuthService.getInstance();
    await authService.logout();

    // In a real implementation, you'd clear cookies or invalidate tokens
    return NextResponse.json({
      message: 'Logout successful'
    });

  } catch (error: unknown) {
    const authError= error as AuthError;
    return NextResponse.json(
      { 
        error: authError.message || 'Logout failed',
        code: authError.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
} 