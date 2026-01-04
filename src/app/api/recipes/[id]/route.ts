import { NextRequest, NextResponse } from 'next/server'
import { RecipeService } from '@/services/recipeService'
import logger from '@/utilities/logger'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const recipeService = new RecipeService()

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recipe = await recipeService.getRecipe(id)
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }
    return NextResponse.json(recipe)
  } catch (error) {
    logger.error('Error fetching recipe', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const updatedRecipe = await recipeService.updateRecipe(id, body)
    if (!updatedRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }
    return NextResponse.json(updatedRecipe)
  } catch (error) {
    logger.error('Error updating recipe', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await recipeService.deleteRecipe(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    logger.error('Error deleting recipe', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
} 