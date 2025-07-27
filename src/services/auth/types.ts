// Core authentication types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  externalId?: string;
  roles: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface AuthProviderConfig {
  clientId: string;
  clientSecret?: string;
  domain?: string;
  region?: string;
  redirectUri?: string;
}

export interface AuthProvider {
  name: string;
  
  // Core auth operations
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  
  // User management
  getCurrentUser(): Promise<AuthUser | null>;
  updateUser(userId: string, data: Partial<AuthUser>): Promise<AuthUser>;
  deleteUser(userId: string): Promise<void>;
  
  // Session management
  validateToken(token: string): Promise<AuthUser | null>;
  revokeToken(token: string): Promise<void>;
  
  // Password management
  resetPassword(email: string): Promise<void>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
  
  // Email verification
  sendVerificationEmail(email: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
}

export type AuthProviderType = 'fusionauth' | 'cognito' | 'mock'; 