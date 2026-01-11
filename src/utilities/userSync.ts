import { prisma } from '@/lib/db';
import logger from '@/utilities/logger';

/**
 * Auth0 user type - matches the user object from Auth0 session
 */
type Auth0User = {
  sub: string;
  email?: string;
  name?: string;
  email_verified?: boolean;
  emailVerified?: boolean;
  [key: string]: unknown;
};

/**
 * Gets or creates a user in the database from an Auth0 user
 * This syncs the Auth0 user information to our database
 */
export async function getOrCreateUserFromAuth0(auth0User: Auth0User) {
  if (!auth0User.sub || !auth0User.email) {
    throw new Error('Auth0 user missing required fields (sub or email)');
  }

  try {
    // Try to find existing user by externalId (Auth0 sub)
    let dbUser = await prisma.user.findUnique({
      where: { externalId: auth0User.sub },
    });

    // If not found by externalId, try by email (in case externalId wasn't set before)
    if (!dbUser && auth0User.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: auth0User.email },
      });
    }

    // Handle email_verified field (can be snake_case or camelCase)
    const emailVerified = 
      auth0User.email_verified ?? 
      auth0User.emailVerified ?? 
      false;

    if (dbUser) {
      // Update existing user with latest Auth0 data
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          externalId: auth0User.sub,
          authProvider: 'auth0',
          email: auth0User.email,
          name: auth0User.name || dbUser.name,
          emailVerified,
        },
      });
    } else {
      // Create new user
      dbUser = await prisma.user.create({
        data: {
          externalId: auth0User.sub,
          authProvider: 'auth0',
          email: auth0User.email,
          name: auth0User.name || null,
          emailVerified,
          roles: [], // Default to empty roles array
        },
      });
    }

    return dbUser;
  } catch (error) {
    logger.error('Error syncing Auth0 user to database', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      auth0Sub: auth0User.sub,
    });
    throw error;
  }
}
