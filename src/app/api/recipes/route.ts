import { NextResponse } from 'next/server'
import { RecipeService } from '@/services/recipeService'
import { Recipe } from '@/types/recipe'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const recipeService = new RecipeService()


export async function GET() {
  try {
    const recipes = await recipeService.getAllRecipes()
    return NextResponse.json(recipes)
  } catch (error: unknown) {
    console.error('Error fetching recipes:', error);
    
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

export async function POST(request: Request) {
  try {
    const recipeData: Recipe = await request.json()
    const recipe = await recipeService.createRecipe(recipeData)
    return NextResponse.json(recipe, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
} 