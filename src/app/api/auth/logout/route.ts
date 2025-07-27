import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth';

export async function POST(request: NextRequest) {
  try {
    const authService = AuthService.getInstance();
    await authService.logout();

    // In a real implementation, you'd clear cookies or invalidate tokens
    return NextResponse.json({
      message: 'Logout successful'
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Logout failed',
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
} 