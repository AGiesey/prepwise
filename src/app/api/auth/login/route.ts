import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth';
import { AuthError } from '@/services/auth/types';


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

    // Create response with user data and tokens
    const response = NextResponse.json({
      user: session.user,
      tokens: session.tokens,
      message: 'Login successful'
    });

    // Set auth cookie on server-side so it's available to middleware immediately
    // This ensures the cookie is set before any redirect happens
    if (session.tokens?.accessToken) {
      response.cookies.set('auth-token', session.tokens.accessToken, {
        path: '/',
        maxAge: 3600, // 1 hour
        sameSite: 'lax',
        httpOnly: false // Set to false so client can also read it if needed
      });
    }

    return response;

  } catch (error: unknown) {
    const authError = error as AuthError;
    return NextResponse.json(
      { 
        error: authError.message || 'Login failed',
        code: authError.code || 'UNKNOWN_ERROR'
      },
      { status: 401 }
    );
  }
} 