import { AuthUser } from '@/services/auth';

/**
 * Check if a user has a specific role
 */
export function hasRole(user: AuthUser | null, role: string): boolean {
  if (!user || !user.roles) {
    return false;
  }
  return user.roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: string[]): boolean {
  if (!user || !user.roles) {
    return false;
  }
  return user.roles.some(role => roles.includes(role));
}

/**
 * Check if a user has all of the specified roles
 */
export function hasAllRoles(user: AuthUser | null, roles: string[]): boolean {
  if (!user || !user.roles) {
    return false;
  }
  return roles.every(role => user.roles.includes(role));
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if a user is a regular user
 */
export function isUser(user: AuthUser | null): boolean {
  return hasRole(user, 'user');
}

/**
 * Get user's highest privilege level
 */
export function getUserPrivilegeLevel(user: AuthUser | null): 'admin' | 'user' | 'none' {
  if (!user || !user.roles) {
    return 'none';
  }
  
  if (user.roles.includes('admin')) {
    return 'admin';
  }
  
  if (user.roles.includes('user')) {
    return 'user';
  }
  
  return 'none';
}

/**
 * Check if a user can access a resource (basic ownership check)
 */
export function canAccessResource(user: AuthUser | null, resourceUserId?: string): boolean {
  if (!user) {
    return false;
  }
  
  // Admins can access all resources
  if (isAdmin(user)) {
    return true;
  }
  
  // Users can only access their own resources
  return resourceUserId === user.id;
} 