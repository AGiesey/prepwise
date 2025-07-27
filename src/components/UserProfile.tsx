'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin, isUser, getUserPrivilegeLevel } from '@/utilities/auth';

export default function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const privilegeLevel = getUserPrivilegeLevel(user);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 text-sm text-gray-900">{user.name || 'Not provided'}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Verified</label>
          <p className="mt-1 text-sm text-gray-900">
            {user.emailVerified ? (
              <span className="text-green-600">✓ Verified</span>
            ) : (
              <span className="text-red-600">✗ Not verified</span>
            )}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Roles</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Privilege Level</label>
          <p className="mt-1 text-sm text-gray-900 capitalize">{privilegeLevel}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Permissions</label>
          <div className="mt-1 space-y-1">
            <p className="text-sm text-gray-900">
              Admin access: {isAdmin(user) ? '✓ Yes' : '✗ No'}
            </p>
            <p className="text-sm text-gray-900">
              User access: {isUser(user) ? '✓ Yes' : '✗ No'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 