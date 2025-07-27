import { hasRole, hasAnyRole, isAdmin, isUser, getUserPrivilegeLevel, canAccessResource } from '../auth';
import { AuthUser } from '@/services/auth';

describe('Auth Utilities', () => {
  const adminUser: AuthUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin User',
    emailVerified: true,
    roles: ['admin', 'user']
  };

  const regularUser: AuthUser = {
    id: 'user-1',
    email: 'user@test.com',
    name: 'Regular User',
    emailVerified: true,
    roles: ['user']
  };

  const noRoleUser: AuthUser = {
    id: 'no-role-1',
    email: 'norole@test.com',
    name: 'No Role User',
    emailVerified: true,
    roles: []
  };

  describe('hasRole', () => {
    it('should return true for admin user with admin role', () => {
      expect(hasRole(adminUser, 'admin')).toBe(true);
    });

    it('should return true for admin user with user role', () => {
      expect(hasRole(adminUser, 'user')).toBe(true);
    });

    it('should return false for regular user with admin role', () => {
      expect(hasRole(regularUser, 'admin')).toBe(false);
    });

    it('should return true for regular user with user role', () => {
      expect(hasRole(regularUser, 'user')).toBe(true);
    });

    it('should return false for null user', () => {
      expect(hasRole(null, 'admin')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if user has any of the specified roles', () => {
      expect(hasAnyRole(adminUser, ['admin', 'moderator'])).toBe(true);
    });

    it('should return false if user has none of the specified roles', () => {
      expect(hasAnyRole(regularUser, ['admin', 'moderator'])).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      expect(isAdmin(adminUser)).toBe(true);
    });

    it('should return false for regular user', () => {
      expect(isAdmin(regularUser)).toBe(false);
    });
  });

  describe('isUser', () => {
    it('should return true for admin user (has user role)', () => {
      expect(isUser(adminUser)).toBe(true);
    });

    it('should return true for regular user', () => {
      expect(isUser(regularUser)).toBe(true);
    });

    it('should return false for user with no roles', () => {
      expect(isUser(noRoleUser)).toBe(false);
    });
  });

  describe('getUserPrivilegeLevel', () => {
    it('should return admin for admin user', () => {
      expect(getUserPrivilegeLevel(adminUser)).toBe('admin');
    });

    it('should return user for regular user', () => {
      expect(getUserPrivilegeLevel(regularUser)).toBe('user');
    });

    it('should return none for user with no roles', () => {
      expect(getUserPrivilegeLevel(noRoleUser)).toBe('none');
    });

    it('should return none for null user', () => {
      expect(getUserPrivilegeLevel(null)).toBe('none');
    });
  });

  describe('canAccessResource', () => {
    it('should return true for admin accessing any resource', () => {
      expect(canAccessResource(adminUser, 'any-user-id')).toBe(true);
    });

    it('should return true for user accessing their own resource', () => {
      expect(canAccessResource(regularUser, 'user-1')).toBe(true);
    });

    it('should return false for user accessing another user\'s resource', () => {
      expect(canAccessResource(regularUser, 'other-user-id')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(canAccessResource(null, 'any-user-id')).toBe(false);
    });
  });
}); 