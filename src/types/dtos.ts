import { Prisma } from '@prisma/client'

// Database types using Prisma's generated types
export const recipeInclude = {
  ingredients: { include: { ingredient: true } },
  instructions: true,
  nutritionInfo: true,
  dietaryRestrictions: { include: { dietaryRestriction: true } }
} as const

export type PrismaRecipe = Prisma.RecipeGetPayload<{ include: typeof recipeInclude }>

// DTOs for API responses
export interface IngredientDTO {
  name: string
  quantity: number
  unit: string
  notes?: string
}

export interface NutritionInfoDTO {
  calories: number
  protein: number
  fat: number
  fiber: number
  carbohydrates: number
  sugar: number
}

export interface RecipeDTO {
  id: string
  title: string
  description: string
  yield: string
  prepTime: number
  cookTime: number
  totalTime: number
  ingredients: IngredientDTO[]
  instructions: string[]
  nutrition: NutritionInfoDTO
  dietary: Record<string, boolean>
  tags: string[]
}

export type CreateRecipeDTO = Omit<RecipeDTO, 'id'> & { id?: string } 