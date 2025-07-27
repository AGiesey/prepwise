import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const authService = AuthService.getInstance();
    const session = await authService.login({ email, password });

    // Return tokens for the client to store
    return NextResponse.json({
      user: session.user,
      tokens: session.tokens,
      message: 'Login successful'
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Login failed',
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 401 }
    );
  }
} 