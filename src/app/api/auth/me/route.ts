import { AuthError } from '@/services/auth/types';
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory token store for development
// In production, you'd use a proper token validation system

// Mock users for development
const mockUsers = {
  'mock-admin-id': {
    id: 'mock-admin-id',
    email: 'admin@test.com',
    name: 'Admin User',
    emailVerified: true,
    externalId: 'mock-external-admin',
    roles: ['admin', 'user']
  },
  'mock-user-id': {
    id: 'mock-user-id',
    email: 'user@test.com',
    name: 'Regular User',
    emailVerified: true,
    externalId: 'mock-external-user',
    roles: ['user']
  }
};

export async function GET(request: NextRequest) {
  try {
    // Check if we have a valid token in the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Extract user ID from token (mock-access-token-{userId})
    const userId = token.replace('mock-access-token-', '');
    const user = mockUsers[userId as keyof typeof mockUsers];

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user
    });

  } catch (error: unknown) {
    const authError = error as AuthError;
    return NextResponse.json(
      { 
        error: authError.message || 'Failed to get current user',
        code: authError.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
} 