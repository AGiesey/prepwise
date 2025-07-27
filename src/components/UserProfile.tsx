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
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.1)] transition-all duration-200">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="mt-1 flex flex-wrap gap-1">
            {user.roles.map((role) => (
              <span
                key={role}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
              Admin: {isAdmin(user) ? '✓' : '✗'}
            </p>
            <p className="text-sm text-gray-900">
              User: {isUser(user) ? '✓' : '✗'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 