import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { AuthService } from '@/services/auth';
import { MockAuthProvider } from '@/services/auth/providers/MockAuthProvider';

// Mock the AuthService
jest.mock('@/services/auth', () => ({
  AuthService: {
    getInstance: jest.fn()
  }
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Test component to access auth context
function TestComponent() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <div data-testid="user-roles">{user?.roles?.join(',') || 'no-roles'}</div>
      <div data-testid="error">{error?.message || 'no-error'}</div>
    </div>
  );
}

describe('AuthContext', () => {
  let mockAuthService: jest.Mocked<AuthService>;
  let mockProvider: MockAuthProvider;

  beforeEach(() => {
    mockProvider = new MockAuthProvider();
    mockAuthService = {
      getCurrentUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      getProviderName: jest.fn().mockReturnValue('mock')
    } as any;

    (AuthService.getInstance as jest.Mock).mockReturnValue(mockAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show authenticated state when user is logged in', async () => {
    const mockUser = {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      roles: ['user']
    };
    
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-roles')).toHaveTextContent('user');
    });
  });

  it('should show unauthenticated state when no user', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    });
  });

  it('should handle authentication errors', async () => {
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Auth error'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });
  });
}); 