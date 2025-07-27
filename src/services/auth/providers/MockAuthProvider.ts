import { AuthProvider } from './AuthProvider';
import { 
  AuthSession, 
  LoginCredentials, 
  AuthUser, 
  AuthTokens, 
  AuthError 
} from '../types';

export class MockAuthProvider extends AuthProvider {
  name = 'mock';
  
  private mockUsers: Map<string, AuthUser> = new Map();
  private mockTokens: Map<string, AuthUser> = new Map();
  private currentUser: AuthUser | null = null;

  constructor() {
    super();
    // Create a default admin user for testing
    this.mockUsers.set('admin@test.com', {
      id: 'mock-admin-id',
      email: 'admin@test.com',
      name: 'Admin User',
      emailVerified: true,
      externalId: 'mock-external-admin',
      roles: ['admin', 'user']
    });

    // Create a default regular user for testing
    this.mockUsers.set('user@test.com', {
      id: 'mock-user-id',
      email: 'user@test.com',
      name: 'Regular User',
      emailVerified: true,
      externalId: 'mock-external-user',
      roles: ['user']
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    this.validateCredentials(credentials);

    const user = this.mockUsers.get(credentials.email);
    if (!user) {
      throw this.createAuthError(
        'INVALID_CREDENTIALS',
        'Invalid email or password'
      );
    }

    // In a real provider, you'd validate the password here
    if (credentials.password !== 'Testing123!') {
      throw this.createAuthError(
        'INVALID_CREDENTIALS',
        'Invalid email or password'
      );
    }

    const tokens: AuthTokens = {
      accessToken: `mock-access-token-${user.id}`,
      refreshToken: `mock-refresh-token-${user.id}`,
      expiresIn: 3600 // 1 hour
    };

    this.currentUser = user;
    this.mockTokens.set(tokens.accessToken, user);

    return {
      user,
      tokens
    };
  }

  async logout(): Promise<void> {
    if (this.currentUser) {
      // Remove all tokens for this user
      for (const [token, user] of this.mockTokens.entries()) {
        if (user.id === this.currentUser.id) {
          this.mockTokens.delete(token);
        }
      }
      this.currentUser = null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Find user by refresh token
    const user = Array.from(this.mockTokens.values()).find(u => 
      refreshToken.includes(u.id)
    );

    if (!user) {
      throw this.createAuthError(
        'INVALID_TOKEN',
        'Invalid refresh token'
      );
    }

    const tokens: AuthTokens = {
      accessToken: `mock-access-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
      expiresIn: 3600
    };

    // Update tokens
    this.mockTokens.set(tokens.accessToken, user);

    return tokens;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser;
  }

  async updateUser(userId: string, data: Partial<AuthUser>): Promise<AuthUser> {
    const user = this.mockUsers.get(userId) || this.currentUser;
    if (!user) {
      throw this.createAuthError(
        'USER_NOT_FOUND',
        'User not found'
      );
    }

    const updatedUser: AuthUser = {
      ...user,
      ...data
    };

    this.mockUsers.set(userId, updatedUser);
    if (this.currentUser?.id === userId) {
      this.currentUser = updatedUser;
    }

    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    this.mockUsers.delete(userId);
    if (this.currentUser?.id === userId) {
      this.currentUser = null;
    }
  }

  async validateToken(token: string): Promise<AuthUser | null> {
    return this.mockTokens.get(token) || null;
  }

  async revokeToken(token: string): Promise<void> {
    this.mockTokens.delete(token);
  }

  async resetPassword(email: string): Promise<void> {
    const user = this.mockUsers.get(email);
    if (!user) {
      throw this.createAuthError(
        'USER_NOT_FOUND',
        'User not found'
      );
    }
    // In a real implementation, this would send an email
    console.log(`Mock: Password reset email sent to ${email}`);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = this.mockUsers.get(userId) || this.currentUser;
    if (!user) {
      throw this.createAuthError(
        'USER_NOT_FOUND',
        'User not found'
      );
    }

    if (oldPassword !== 'Testing123!') {
      throw this.createAuthError(
        'INVALID_PASSWORD',
        'Invalid current password'
      );
    }

    // In a real implementation, this would update the password
    console.log(`Mock: Password changed for user ${userId}`);
  }

  async sendVerificationEmail(email: string): Promise<void> {
    const user = this.mockUsers.get(email);
    if (!user) {
      throw this.createAuthError(
        'USER_NOT_FOUND',
        'User not found'
      );
    }
    // In a real implementation, this would send an email
    console.log(`Mock: Verification email sent to ${email}`);
  }

  async verifyEmail(token: string): Promise<void> {
    // In a real implementation, this would validate the token and mark email as verified
    console.log(`Mock: Email verified with token ${token}`);
  }

  // Mock-specific methods for testing
  setCurrentUser(user: AuthUser | null): void {
    this.currentUser = user;
  }

  addMockUser(user: AuthUser): void {
    this.mockUsers.set(user.email, user);
  }

  clearMockUsers(): void {
    this.mockUsers.clear();
    this.mockTokens.clear();
    this.currentUser = null;
  }
} 