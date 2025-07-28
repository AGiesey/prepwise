import { AuthProvider, AuthSession, LoginCredentials, AuthUser, AuthTokens, AuthError } from './types';
import { MockAuthProvider } from './providers/MockAuthProvider';

export class AuthService {
  private provider: AuthProvider;
  private static instance: AuthService;

  private constructor() {
    this.provider = this.createProvider();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private createProvider(): AuthProvider {
    const providerType = process.env.AUTH_PROVIDER as string || 'mock';
    
    switch (providerType.toLowerCase()) {
      case 'mock':
      default:
        return new MockAuthProvider();
      
      // TODO: Add other providers when implemented
      // case 'fusionauth':
      //   return new FusionAuthProvider({
      //     clientId: process.env.FUSIONAUTH_CLIENT_ID!,
      //     clientSecret: process.env.FUSIONAUTH_CLIENT_SECRET,
      //     domain: process.env.FUSIONAUTH_DOMAIN!,
      //     redirectUri: process.env.FUSIONAUTH_REDIRECT_URI,
      //   });
      
      // case 'cognito':
      //   return new CognitoProvider({
      //     clientId: process.env.COGNITO_CLIENT_ID!,
      //     clientSecret: process.env.COGNITO_CLIENT_SECRET,
      //     region: process.env.COGNITO_REGION!,
      //     redirectUri: process.env.COGNITO_REDIRECT_URI,
      //   });
    }
  }

  // Core auth operations
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      return await this.provider.login(credentials);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.provider.logout();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      return await this.provider.refreshToken(refreshToken);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User management
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      return await this.provider.getCurrentUser();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(userId: string, data: Partial<AuthUser>): Promise<AuthUser> {
    try {
      return await this.provider.updateUser(userId, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.provider.deleteUser(userId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Session management
  async validateToken(token: string): Promise<AuthUser | null> {
    try {
      return await this.provider.validateToken(token);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async revokeToken(token: string): Promise<void> {
    try {
      await this.provider.revokeToken(token);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Password management
  async resetPassword(email: string): Promise<void> {
    try {
      await this.provider.resetPassword(email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      await this.provider.changePassword(userId, oldPassword, newPassword);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Email verification
  async sendVerificationEmail(email: string): Promise<void> {
    try {
      await this.provider.sendVerificationEmail(email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await this.provider.verifyEmail(token);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  getProviderName(): string {
    return this.provider.name;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(error: any): AuthError {
    // Standardize error handling across providers
    if (error.code && error.message) {
      return error as AuthError;
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
    };
  }
} 