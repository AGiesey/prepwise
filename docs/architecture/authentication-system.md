# Authentication System Architecture

## Overview

This document outlines the architecture for implementing a third-party authentication system that can be easily swapped between different providers (FusionAuth, AWS Cognito, etc.) while maintaining a consistent interface throughout the application.

## Design Goals

1. **Provider Agnostic**: The application should not be tightly coupled to any specific authentication provider
2. **Easy Swapping**: Change authentication providers via environment variables without code changes
3. **Type Safety**: Strong typing for all authentication operations
4. **Consistent Interface**: Uniform API regardless of the underlying provider
5. **Security**: Proper token management and session handling
6. **User Ownership**: Tie recipes and other resources to authenticated users

## Architecture Components

### 1. Service Layer

```
src/services/auth/
├── AuthService.ts              # Main service interface
├── types.ts                    # Shared types and interfaces
├── providers/
│   ├── AuthProvider.ts         # Base provider interface
│   ├── FusionAuthProvider.ts   # FusionAuth implementation
│   ├── CognitoProvider.ts      # AWS Cognito implementation
│   └── MockAuthProvider.ts     # Development/testing provider
└── index.ts                    # Exports
```

### 2. Database Schema Changes

#### User Model Updates
```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  name              String?
  externalId        String?  @unique  // ID from auth provider
  authProvider      String?  // "fusionauth", "cognito", etc.
  emailVerified     Boolean  @default(false)
  roles             String[] // Array of roles: user, admin, moderator, etc.
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  recipes           Recipe[]
}
```

#### Recipe Model Updates
```prisma
model Recipe {
  id                  String                     @id @default(uuid())
  title               String
  description         String
  yield               String
  prepTime            Int
  cookTime            Int
  totalTime           Int
  userId              String?                    // Owner of the recipe
  isPublic            Boolean                    @default(false)
  createdAt           DateTime                   @default(now())
  updatedAt           DateTime                   @updatedAt
  
  // Relations
  user                User?                      @relation(fields: [userId], references: [id])
  nutritionInfo       NutritionInfo?
  dietaryRestrictions RecipeDietaryRestriction[]
  ingredients         RecipeIngredient[]
  instructions        RecipeInstruction[]
  tags                RecipeTag[]
}
```



### 3. Types and Interfaces

```typescript
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
```

### 4. Provider Interface

All authentication providers must implement the following interface:

```typescript
interface AuthProvider {
  name: string;
  
  // Core auth operations
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(data: RegisterData): Promise<AuthSession>;
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
```

### 5. Environment Configuration

```env
# Authentication Provider Selection
AUTH_PROVIDER=mock|fusionauth|cognito

# FusionAuth Configuration
FUSIONAUTH_CLIENT_ID=your_client_id
FUSIONAUTH_CLIENT_SECRET=your_client_secret
FUSIONAUTH_DOMAIN=your_domain
FUSIONAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# AWS Cognito Configuration
COGNITO_CLIENT_ID=your_client_id
COGNITO_CLIENT_SECRET=your_client_secret
COGNITO_REGION=us-east-1
COGNITO_REDIRECT_URI=http://localhost:3000/auth/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Database Schema Updates
- [x] Create Prisma migration for new User model (roles array, externalId, authProvider)
- [x] Update Recipe model to include userId and isPublic fields
- [x] Run migrations and update seed data

#### 1.2 Authentication Service Layer
- [x] Create `src/services/auth/types.ts` with all interfaces
- [x] Create `src/services/auth/AuthService.ts` (main service wrapper)
- [x] Create `src/services/auth/providers/AuthProvider.ts` (base interface)
- [x] Create `src/services/auth/providers/MockAuthProvider.ts` (development provider)
- [x] Create `src/services/auth/index.ts` (exports)

#### 1.3 API Routes
- [x] Create `/api/auth/login` endpoint
- [x] Create `/api/auth/logout` endpoint
- [x] Create `/api/auth/me` endpoint (get current user)
- [x] Create authentication middleware for protected routes

### Phase 2: Frontend Integration

#### 2.1 Update AuthContext
- [x] Refactor `src/contexts/AuthContext.tsx` to use new AuthService
- [x] Implement proper token management (JWT storage/refresh)
- [x] Add user state management with roles
- [x] Update loading states and error handling

#### 2.2 Authentication UI
- [x] Update `src/components/LoginForm.tsx` to use new auth service
- [ ] Create `src/components/InvitationAcceptForm.tsx` (for accepting invites) - *Removed from scope*
- [x] Update protected route components

#### 2.3 User Management UI
- [x] Create user profile page
- [x] Update navigation to show user info
- [x] Add logout functionality

### Phase 3: Role-Based Access Control

#### 3.1 Role Management
- [x] Create role checking utilities
- [ ] Implement admin-only route protection
- [x] Add role-based UI components
- [x] Create permission checking hooks

### Phase 4: Recipe Ownership

#### 4.1 Recipe API Updates
- [ ] Update `/api/recipes` to include user ownership
- [ ] Add user filtering to recipe endpoints
- [ ] Implement recipe access control (public/private)
- [ ] Add user-specific recipe queries

#### 4.2 Recipe UI Updates
- [ ] Update recipe creation to include user ownership
- [ ] Add user-specific recipe lists
- [ ] Implement recipe privacy controls
- [ ] Create user dashboard with personal recipes



### Phase 5: Provider Integration

#### 5.1 FusionAuth Integration
- [ ] Set up FusionAuth instance
- [ ] Create `src/services/auth/providers/FusionAuthProvider.ts`
- [ ] Implement all required methods
- [ ] Add FusionAuth configuration

#### 5.2 AWS Cognito Integration
- [ ] Set up AWS Cognito User Pool
- [ ] Create `src/services/auth/providers/CognitoProvider.ts`
- [ ] Implement all required methods
- [ ] Add Cognito configuration

#### 5.3 Provider Testing
- [ ] Test both providers end-to-end
- [ ] Validate invitation flows
- [ ] Test role assignment
- [ ] Performance testing

### Phase 6: Integration & Polish

#### 6.1 Chat System Integration
- [ ] Update chat context to include user information
- [ ] Implement user-specific memory isolation
- [ ] Add user context to chat responses
- [ ] Update chat UI to show user info

#### 6.2 Error Handling & Validation
- [ ] Comprehensive error handling for auth failures
- [ ] Input validation for all auth forms
- [ ] User-friendly error messages
- [ ] Logging and monitoring

#### 6.3 Security & Testing
- [ ] Security audit of authentication flow
- [ ] Penetration testing of auth endpoints
- [ ] Unit tests for all auth components
- [ ] Integration tests for auth flows

## Technical Implementation Details

### Environment Variables Needed
```env
# Authentication Provider
AUTH_PROVIDER=mock|fusionauth|cognito

# FusionAuth
FUSIONAUTH_CLIENT_ID=
FUSIONAUTH_CLIENT_SECRET=
FUSIONAUTH_DOMAIN=
FUSIONAUTH_REDIRECT_URI=

# AWS Cognito
COGNITO_CLIENT_ID=
COGNITO_CLIENT_SECRET=
COGNITO_REGION=
COGNITO_REDIRECT_URI=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

### Key Files to Create
```
src/
├── services/auth/
│   ├── types.ts
│   ├── AuthService.ts
│   ├── providers/
│   │   ├── AuthProvider.ts
│   │   ├── MockAuthProvider.ts
│   │   ├── FusionAuthProvider.ts
│   │   └── CognitoProvider.ts
│   └── index.ts
├── app/api/auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── me/route.ts
└── components/auth/
    └── LoginForm.tsx
```



### Success Criteria
1. **User authentication** with multiple providers
2. **Recipe ownership** and user-specific filtering
3. **Role-based access control** throughout the app
4. **Secure token management** and session handling

## Security Considerations

1. **Token Management**: Secure storage and rotation of access/refresh tokens
2. **Session Handling**: Proper session validation and cleanup
3. **CSRF Protection**: Implement CSRF tokens for state-changing operations
4. **Rate Limiting**: Prevent brute force attacks on authentication endpoints
5. **Input Validation**: Validate all authentication inputs
6. **Error Handling**: Don't leak sensitive information in error messages

## Migration Strategy

1. **Database Migration**: Add new fields with default values
2. **Gradual Rollout**: Deploy authentication system alongside existing system
3. **User Migration**: Create external auth accounts for existing users
4. **Data Migration**: Associate existing recipes with authenticated users
5. **Testing**: Comprehensive testing with each provider

## Testing Strategy

1. **Unit Tests**: Test each provider implementation independently
2. **Integration Tests**: Test authentication flow end-to-end
3. **Provider Tests**: Test with actual provider instances
4. **Security Tests**: Penetration testing of authentication endpoints
5. **Performance Tests**: Load testing of authentication system

## Monitoring and Observability

1. **Authentication Metrics**: Track login success/failure rates
2. **Provider Performance**: Monitor response times for each provider
3. **Error Tracking**: Log and alert on authentication errors
4. **User Analytics**: Track user engagement and retention
5. **Security Monitoring**: Detect suspicious authentication patterns

## Future Considerations

1. **Multi-Factor Authentication**: Support for MFA across providers
2. **Social Login**: Integration with Google, GitHub, etc.
3. **Role-Based Access Control**: Implement user roles and permissions
4. **Audit Logging**: Track all authentication and authorization events
5. **Compliance**: Ensure GDPR and other compliance requirements 