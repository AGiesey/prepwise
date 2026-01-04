/* eslint-disable */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { RecipeService } from '@/services/recipeService';

export const runtime = "nodejs";

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

export async function GET() {
  const result: HealthCheckResult = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: {},
    summary: {
      overall: 'unhealthy',
      details: []
    }
  };

  // Parse DATABASE_URL for info (without exposing password)
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      result.databaseUrl = {
        exists: true,
        hasUser: !!url.username,
        hasHost: !!url.hostname,
        hasDatabase: !!url.pathname && url.pathname.length > 1,
        hostPreview: url.hostname ? `${url.hostname.substring(0, 20)}...` : undefined,
        userPreview: url.username ? `${url.username.substring(0, 10)}...` : undefined,
        databasePreview: url.pathname ? url.pathname.substring(1).substring(0, 20) : undefined,
      };
      result.summary.details.push('DATABASE_URL environment variable is set');
    } catch (e) {
      result.databaseUrl = { exists: true, hasUser: false, hasHost: false, hasDatabase: false };
      result.summary.details.push('DATABASE_URL exists but is malformed');
    }
  } else {
    result.databaseUrl = { exists: false, hasUser: false, hasHost: false, hasDatabase: false };
    result.summary.details.push('DATABASE_URL environment variable is NOT set');
  }

  // Test 1: Prisma Connection
  try {
    const testStart = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const testDuration = Date.now() - testStart;
    
    result.tests.prismaConnection = {
      success: true,
      duration: testDuration
    };
    result.summary.details.push(`Prisma connection test: SUCCESS (${testDuration}ms)`);
  } catch (error) {
    const testDuration = Date.now() - (result.tests.prismaConnection?.duration || Date.now());
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    result.tests.prismaConnection = {
      success: false,
      error: errorMessage,
      duration: testDuration
    };
    result.summary.details.push(`Prisma connection test: FAILED - ${errorMessage}`);
    
    // Return early if basic connection fails
    return NextResponse.json(result, { status: 500 });
  }

  // Test 2: Read Test (fetch recipes)
  try {
    const testStart = Date.now();
    const recipeService = new RecipeService();
    const recipes = await recipeService.getAllRecipes();
    const testDuration = Date.now() - testStart;
    
    result.tests.readTest = {
      success: true,
      duration: testDuration,
      recipeCount: recipes.length
    };
    result.summary.details.push(`Read test (getAllRecipes): SUCCESS - Found ${recipes.length} recipes (${testDuration}ms)`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    result.tests.readTest = {
      success: false,
      error: errorMessage,
      duration: 0
    };
    result.summary.details.push(`Read test (getAllRecipes): FAILED - ${errorMessage}`);
  }

  // Determine overall status
  const allTestsPassed = result.tests.prismaConnection?.success && result.tests.readTest?.success;
  const basicConnectionWorks = result.tests.prismaConnection?.success;
  
  if (allTestsPassed) {
    result.summary.overall = 'healthy';
  } else if (basicConnectionWorks) {
    result.summary.overall = 'degraded';
  } else {
    result.summary.overall = 'unhealthy';
  }

  const statusCode = result.summary.overall === 'healthy' ? 200 : 500;
  return NextResponse.json(result, { status: statusCode });
} 