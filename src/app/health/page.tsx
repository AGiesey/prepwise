'use client';

import { useEffect, useState } from 'react';

interface HealthCheckResult {
  timestamp: string;
  environment: string | undefined;
  databaseUrl?: {
    exists: boolean;
    hasUser: boolean;
    hasHost: boolean;
    hasDatabase: boolean;
    hostPreview?: string;
    userPreview?: string;
    databasePreview?: string;
  };
  tests: {
    prismaConnection?: {
      success: boolean;
      error?: string;
      duration?: number;
    };
    readTest?: {
      success: boolean;
      error?: string;
      duration?: number;
      recipeCount?: number;
    };
  };
  summary: {
    overall: 'healthy' | 'unhealthy' | 'degraded';
    details: string[];
  };
}

export default function HealthCheckPage() {
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await fetch('/api/health/db');
        const data = await response.json();
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health data');
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (success?: boolean) => {
    if (success === undefined) return null;
    return success ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ Success
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ✗ Failed
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Health Check Error</h1>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">No Health Data</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Database Health Check</h1>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(
                healthData.summary.overall
              )}`}
            >
              {healthData.summary.overall.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600">
            Last checked: {new Date(healthData.timestamp).toLocaleString()}
          </p>
          {healthData.environment && (
            <p className="text-gray-600">Environment: {healthData.environment}</p>
          )}
        </div>

        {/* DATABASE_URL Info */}
        {healthData.databaseUrl && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">DATABASE_URL Configuration</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Exists</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {healthData.databaseUrl.exists ? '✓ Yes' : '✗ No'}
                </dd>
              </div>
              {healthData.databaseUrl.exists && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Has User</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {healthData.databaseUrl.hasUser ? '✓ Yes' : '✗ No'}
                      {healthData.databaseUrl.userPreview && (
                        <span className="text-gray-500 ml-2">({healthData.databaseUrl.userPreview})</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Has Host</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {healthData.databaseUrl.hasHost ? '✓ Yes' : '✗ No'}
                      {healthData.databaseUrl.hostPreview && (
                        <span className="text-gray-500 ml-2">({healthData.databaseUrl.hostPreview})</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Has Database</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {healthData.databaseUrl.hasDatabase ? '✓ Yes' : '✗ No'}
                      {healthData.databaseUrl.databasePreview && (
                        <span className="text-gray-500 ml-2">({healthData.databaseUrl.databasePreview})</span>
                      )}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        )}

        {/* Tests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Connection Tests</h2>
          <div className="space-y-6">
            {/* Prisma Connection Test */}
            {healthData.tests.prismaConnection && (
              <div className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Prisma Connection Test</h3>
                  {getStatusBadge(healthData.tests.prismaConnection.success)}
                </div>
                {healthData.tests.prismaConnection.duration !== undefined && (
                  <p className="text-sm text-gray-600 mb-2">
                    Duration: {healthData.tests.prismaConnection.duration}ms
                  </p>
                )}
                {healthData.tests.prismaConnection.error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800">Error:</p>
                    <p className="text-sm text-red-700 mt-1 font-mono break-all">
                      {healthData.tests.prismaConnection.error}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Read Test */}
            {healthData.tests.readTest && (
              <div className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Read Test (getAllRecipes)</h3>
                  {getStatusBadge(healthData.tests.readTest.success)}
                </div>
                {healthData.tests.readTest.recipeCount !== undefined && (
                  <p className="text-sm text-gray-600 mb-2">
                    Recipes found: {healthData.tests.readTest.recipeCount}
                  </p>
                )}
                {healthData.tests.readTest.duration !== undefined && (
                  <p className="text-sm text-gray-600 mb-2">
                    Duration: {healthData.tests.readTest.duration}ms
                  </p>
                )}
                {healthData.tests.readTest.error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800">Error:</p>
                    <p className="text-sm text-red-700 mt-1 font-mono break-all">
                      {healthData.tests.readTest.error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Summary</h2>
          <ul className="space-y-2">
            {healthData.summary.details.map((detail, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Refresh Button */}
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetch('/api/health/db')
                .then((res) => res.json())
                .then((data) => {
                  setHealthData(data);
                  setError(null);
                })
                .catch((err) => {
                  setError(err instanceof Error ? err.message : 'Failed to fetch health data');
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Health Check
          </button>
        </div>
      </div>
    </div>
  );
}

