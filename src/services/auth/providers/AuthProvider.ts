import { 
  AuthProvider as IAuthProvider,
  AuthSession, 
  LoginCredentials, 
  AuthUser, 
  AuthTokens, 
  AuthError 
} from '../types';

export abstract class AuthProvider implements IAuthProvider {
  abstract name: string;
  
  // Core auth operations
  abstract login(credentials: LoginCredentials): Promise<AuthSession>;
  abstract logout(): Promise<void>;
  abstract refreshToken(refreshToken: string): Promise<AuthTokens>;
  
  // User management
  abstract getCurrentUser(): Promise<AuthUser | null>;
  abstract updateUser(userId: string, data: Partial<AuthUser>): Promise<AuthUser>;
  abstract deleteUser(userId: string): Promise<void>;
  
  // Session management
  abstract validateToken(token: string): Promise<AuthUser | null>;
  abstract revokeToken(token: string): Promise<void>;
  
  // Password management
  abstract resetPassword(email: string): Promise<void>;
  abstract changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
  
  // Email verification
  abstract sendVerificationEmail(email: string): Promise<void>;
  abstract verifyEmail(token: string): Promise<void>;

  // Utility methods
  protected createAuthError(code: string, message: string, details?: any): AuthError {
    return {
      code,
      message,
      details
    };
  }

  protected validateCredentials(credentials: LoginCredentials): void {
    if (!credentials.email || !credentials.password) {
      throw this.createAuthError(
        'INVALID_CREDENTIALS',
        'Email and password are required'
      );
    }

    if (!credentials.email.includes('@')) {
      throw this.createAuthError(
        'INVALID_EMAIL',
        'Please provide a valid email address'
      );
    }

    if (credentials.password.length < 6) {
      throw this.createAuthError(
        'WEAK_PASSWORD',
        'Password must be at least 6 characters long'
      );
    }
  }
} 