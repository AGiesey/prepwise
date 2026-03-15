import { PrismaRecipe, RecipeDTO, CreateRecipeDTO, recipeInclude } from '@/types/dtos'
import { prisma } from '@/lib/db'
import { logDebug } from '@/utilities/logger'
import logger from '@/utilities/logger'

// Only test connection in development
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => logDebug('RecipeService: Connected to database'))
    .catch((e) => logger.error('RecipeService: Failed to connect', { error: e }))
}

export const chatRecipeInclude = {
  ingredients: {
    select: {
      ingredient: {
        select: {
          name: true
        }
      },
      quantity: true,
      unit: true,
      notes: true
    }
  },
  instructions: {
    select: {
      instruction: true,
      stepNumber: true
    }
  },
  nutritionInfo: {
    select: {
      calories: true,
      protein: true,
      fat: true,
      fiber: true,
      carbohydrates: true,
      sugar: true
    }
  },
  dietaryRestrictions: {
    select: {
      dietaryRestriction: {
        select: {
          name: true
        }
      }
    }
  }
} as const;

export class RecipeService {
  // Create a new recipe
  async createRecipe(recipeData: CreateRecipeDTO, createdBy: string) {
    // Resolve ingredients (upsert + deduplicate)
    const resolvedIngredients = await Promise.all(
      recipeData.ingredients.map(async (ingredientData) => {
        const ingredient = await prisma.ingredient.upsert({
          where: { name: ingredientData.name },
          update: {},
          create: { name: ingredientData.name }
        })
        return { ingredient, ...ingredientData }
      })
    )
    const seenIngredients = new Set<string>()
    const ingredients = resolvedIngredients.filter(({ ingredient }) => {
      if (seenIngredients.has(ingredient.id)) return false
      seenIngredients.add(ingredient.id)
      return true
    })

    // Resolve dietary restrictions
    const dietaryEntries = Object.entries(recipeData.dietary || {}).filter(([, v]) => v)
    const dietaryRestrictions = await Promise.all(
      dietaryEntries.map(async ([name]) => {
        const restriction = await prisma.dietaryRestriction.upsert({
          where: { name },
          update: {},
          create: { name }
        })
        return restriction
      })
    )

    // Create the recipe
    const recipe = await prisma.recipe.create({
      data: {
        title: recipeData.title,
        description: recipeData.description,
        yield: recipeData.yield,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        totalTime: recipeData.totalTime,
        createdBy: createdBy,
        ingredients: {
          create: ingredients.map(({ ingredient, quantity, unit, notes }) => ({
            ingredient: { connect: { id: ingredient.id } },
            quantity,
            unit,
            notes
          }))
        },
        instructions: {
          create: recipeData.instructions.map((instruction, index) => ({
            stepNumber: index + 1,
            instruction
          }))
        },
        nutritionInfo: {
          create: {
            calories: Math.round(recipeData.nutrition.calories),
            protein: recipeData.nutrition.protein,
            fat: recipeData.nutrition.fat,
            fiber: recipeData.nutrition.fiber,
            carbohydrates: recipeData.nutrition.carbohydrates,
            sugar: recipeData.nutrition.sugar
          }
        },
        ...(dietaryRestrictions.length > 0 && {
          dietaryRestrictions: {
            create: dietaryRestrictions.map((restriction) => ({
              dietaryRestriction: { connect: { id: restriction.id } }
            }))
          }
        })
      },
      include: recipeInclude
    })

    return this.formatRecipeForResponse(recipe)
  }

  // Get a recipe by ID
  async getRecipe(id: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: recipeInclude
    })

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    return this.formatRecipeForResponse(recipe)
  }

  // Get all recipes
  async getAllRecipes() {
    const recipes = await prisma.recipe.findMany({
      include: recipeInclude
    })

    return recipes.map(recipe => this.formatRecipeForResponse(recipe))
  }

  // Update a recipe
  async updateRecipe(id: string, recipeData: Partial<RecipeDTO>) {
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: recipeInclude
    })

    if (!existingRecipe) {
      throw new Error('Recipe not found')
    }

    // Resolve ingredients if provided (upsert + deduplicate)
    let resolvedIngredients: { ingredient: { id: string }, quantity: number, unit: string, notes?: string }[] | undefined
    if (recipeData.ingredients) {
      const raw = await Promise.all(
        recipeData.ingredients.map(async (ingredientData) => {
          const ingredient = await prisma.ingredient.upsert({
            where: { name: ingredientData.name },
            update: {},
            create: { name: ingredientData.name }
          })
          return { ingredient, ...ingredientData }
        })
      )
      const seen = new Set<string>()
      resolvedIngredients = raw.filter(({ ingredient }) => {
        if (seen.has(ingredient.id)) return false
        seen.add(ingredient.id)
        return true
      })
    }

    // Resolve dietary restrictions if provided
    let resolvedDietary: { id: string }[] | undefined
    if (recipeData.dietary) {
      const dietaryEntries = Object.entries(recipeData.dietary).filter(([, v]) => v)
      resolvedDietary = await Promise.all(
        dietaryEntries.map(async ([name]) =>
          prisma.dietaryRestriction.upsert({ where: { name }, update: {}, create: { name } })
        )
      )
    }

    // Update the recipe
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title: recipeData.title,
        description: recipeData.description,
        yield: recipeData.yield,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        totalTime: recipeData.totalTime,
        ...(resolvedIngredients && {
          ingredients: {
            deleteMany: {},
            create: resolvedIngredients.map(({ ingredient, quantity, unit, notes }) => ({
              ingredient: { connect: { id: ingredient.id } },
              quantity,
              unit,
              notes
            }))
          }
        }),
        ...(recipeData.instructions && {
          instructions: {
            deleteMany: {},
            create: recipeData.instructions.map((instruction, index) => ({
              stepNumber: index + 1,
              instruction
            }))
          }
        }),
        ...(recipeData.nutrition && {
          nutritionInfo: {
            update: {
              calories: Math.round(recipeData.nutrition.calories),
              protein: recipeData.nutrition.protein,
              fat: recipeData.nutrition.fat,
              fiber: recipeData.nutrition.fiber,
              carbohydrates: recipeData.nutrition.carbohydrates,
              sugar: recipeData.nutrition.sugar
            }
          }
        }),
        ...(resolvedDietary && {
          dietaryRestrictions: {
            deleteMany: {},
            create: resolvedDietary.map((restriction) => ({
              dietaryRestriction: { connect: { id: restriction.id } }
            }))
          }
        })
      },
      include: recipeInclude
    })

    return this.formatRecipeForResponse(recipe)
  }

  // Delete a recipe
  async deleteRecipe(id: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    })

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    await prisma.recipe.delete({
      where: { id }
    })

    return { success: true }
  }

  // Helper function to format recipe for response
  private formatRecipeForResponse(recipe: PrismaRecipe): RecipeDTO {
    if (!recipe.nutritionInfo) {
      throw new Error('Recipe must have nutrition info')
    }
    
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      yield: recipe.yield,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      ingredients: recipe.ingredients.map(ri => ({
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.unit,
        notes: ri.notes || undefined
      })),
      instructions: recipe.instructions.map(i => i.instruction),
      nutrition: recipe.nutritionInfo,
      dietary: recipe.dietaryRestrictions.reduce((acc, dr) => {
        acc[dr.dietaryRestriction.name] = true
        return acc
      }, {} as Record<string, boolean>),
      tags: []
    }
  }

  async getRecipeContextForChat(id: string) {
    return await prisma.recipe.findUnique({
      where: { id },
      include: chatRecipeInclude
    });
  }
} 