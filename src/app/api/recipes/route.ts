import { NextResponse } from 'next/server'
import { RecipeService } from '@/services/recipeService'
import { Recipe } from '@/types/recipe'

const recipeService = new RecipeService()

export async function GET() {
  try {
    const recipes = await recipeService.getAllRecipes()
    return NextResponse.json(recipes)
  } catch (error: unknown) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
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