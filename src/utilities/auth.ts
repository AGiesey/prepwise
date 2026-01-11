import { User } from '@auth0/nextjs-auth0';

// Helper to get roles from Auth0 user (roles are typically in a custom claim)
function getUserRoles(user: User | null | undefined): string[] {
  if (!user) {
    return [];
  }
  
  // Auth0 roles are typically stored in a custom claim like 'https://your-domain/roles'
  // or in the 'roles' property if configured
  // You may need to adjust this based on your Auth0 configuration
  const roles = (user as any)['https://your-domain/roles'] || (user as any).roles || [];
  return Array.isArray(roles) ? roles : [];
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null | undefined, role: string): boolean {
  if (!user) {
    return false;
  }
  const roles = getUserRoles(user);
  return roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: User | null | undefined, roles: string[]): boolean {
  if (!user) {
    return false;
  }
  const userRoles = getUserRoles(user);
  return userRoles.some(role => roles.includes(role));
}

/**
 * Check if a user has all of the specified roles
 */
export function hasAllRoles(user: User | null | undefined, roles: string[]): boolean {
  if (!user) {
    return false;
  }
  const userRoles = getUserRoles(user);
  return roles.every(role => userRoles.includes(role));
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if a user is a regular user
 */
export function isUser(user: User | null | undefined): boolean {
  return hasRole(user, 'user');
}

/**
 * Get user's highest privilege level
 */
export function getUserPrivilegeLevel(user: User | null | undefined): 'admin' | 'user' | 'none' {
  if (!user) {
    return 'none';
  }
  
  const roles = getUserRoles(user);
  
  if (roles.includes('admin')) {
    return 'admin';
  }
  
  if (roles.includes('user')) {
    return 'user';
  }
  
  return 'none';
}

/**
 * Check if a user can access a resource (basic ownership check)
 * Uses Auth0's 'sub' (subject) as the user ID
 */
export function canAccessResource(user: User | null | undefined, resourceUserId?: string): boolean {
  if (!user) {
    return false;
  }
  
  // Admins can access all resources
  if (isAdmin(user)) {
    return true;
  }
  
  // Users can only access their own resources
  // Auth0 uses 'sub' as the user identifier
  return resourceUserId === user.sub;
} 