import { headers, cookies } from 'next/headers';
import { auth0 } from '@/lib/auth0';
import { getOrCreateUserFromAuth0 } from '@/utilities/userSync';
import { NextRequest } from 'next/server';

/**
 * Gets the current database user in a server component
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  try {
    // Get headers and cookies to construct a proper request
    const headersList = await headers();
    const cookieStore = await cookies();
    
    // Format cookies as a string
    const cookieStrings: string[] = [];
    cookieStore.getAll().forEach((cookie) => {
      cookieStrings.push(`${cookie.name}=${cookie.value}`);
    });
    const cookieHeader = cookieStrings.join('; ');
    
    // Create headers object with cookies included
    const allHeaders = new Headers();
    headersList.forEach((value, key) => {
      allHeaders.set(key, value);
    });
    if (cookieHeader) {
      allHeaders.set('cookie', cookieHeader);
    }

    // Create a request object that auth0.getSession can use
    const request = new NextRequest('http://localhost', {
      headers: allHeaders,
    });

    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      return null;
    }

    const dbUser = await getOrCreateUserFromAuth0(session.user);
    return dbUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
