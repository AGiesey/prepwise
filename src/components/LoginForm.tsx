'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button/Button';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, clearError, isLoggingIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoggingIn) return;
    
    try {
      clearError();
      await login({ email, password });
      // If login succeeds, the form will be cleared by the redirect
    } catch (error) {
      // Error is handled by the AuthContext
      console.error('Login failed:', error);
      // Don't clear the form on error - let user see what they entered
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error.message}
        </div>
      )}
      
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoggingIn}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoggingIn}
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>

      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-200">
        <p className="font-medium text-gray-700 mb-2">Test Accounts</p>
        <div className="space-y-1 text-xs">
          <p><span className="font-medium">Admin:</span> admin@test.com / Testing123!</p>
          <p><span className="font-medium">User:</span> user@test.com / Testing123!</p>
        </div>
      </div>
    </form>
  );
} 