import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { RecipeService } from '@/services/recipeService'
import { Recipe } from '@/types/recipe'
import { auth0 } from '@/lib/auth0'
import { getOrCreateUserFromAuth0 } from '@/utilities/userSync'
import logger from '@/utilities/logger'

function translateSaveError(error: unknown): { error: string; fields?: Record<string, string> } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return { error: 'A duplicate entry was detected. Try refreshing the page and saving again.' };
      case 'P2000':
        return { error: 'One of the fields is too long. Please shorten it and try again.' };
      case 'P2003':
        return { error: 'A required relationship is missing. Please try again.' };
      default:
        return { error: 'There was a problem saving the recipe. Please try again.' };
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      error: 'Some fields have unexpected values.',
      fields: { ingredients: 'Check that all ingredient quantities are numbers.' }
    };
  }
  return { error: 'Failed to save recipe. Please try again.' };
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const recipeService = new RecipeService()


export async function GET() {
  try {
    const recipes = await recipeService.getAllRecipes()
    return NextResponse.json(recipes)
  } catch (error: unknown) {
    logger.error('Error fetching recipes', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      name: error instanceof Error ? error.name : 'Error',
      stack: error instanceof Error ? error.stack : undefined,
      ...(error && typeof error === 'object' && 'cause' in error ? { cause: error.cause } : {}),
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch recipes',
        details: errorDetails
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current authenticated user
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const dbUser = await getOrCreateUserFromAuth0(session.user);
    
    const recipeData: Recipe = await request.json()
    const recipe = await recipeService.createRecipe(recipeData, dbUser.id)
    return NextResponse.json(recipe, { status: 201 })
  } catch (error: unknown) {
    logger.error('Error creating recipe', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(translateSaveError(error), { status: 500 });
  }
} 