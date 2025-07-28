import { PrismaRecipe, RecipeDTO, CreateRecipeDTO, recipeInclude } from '@/types/dtos'
import { prisma } from '@/lib/db'

prisma.$connect()
  .then(() => console.log('RecipeService: Connected to database'))
  .catch((e) => console.error('RecipeService: Failed to connect:', e))

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
  async createRecipe(recipeData: CreateRecipeDTO) {
    // Create or find ingredients
    const ingredientPromises = recipeData.ingredients.map(async (ingredientData) => {
      let ingredient = await prisma.ingredient.findFirst({
        where: { name: ingredientData.name }
      })

      if (!ingredient) {
        ingredient = await prisma.ingredient.create({
          data: { name: ingredientData.name }
        })
      }

      return { ingredient, ...ingredientData }
    })
    const ingredients = await Promise.all(ingredientPromises)

    // Create the recipe
    const recipe = await prisma.recipe.create({
      data: {
        title: recipeData.title,
        description: recipeData.description,
        yield: recipeData.yield,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        totalTime: recipeData.totalTime,
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
            calories: recipeData.nutrition.calories,
            protein: recipeData.nutrition.protein,
            fat: recipeData.nutrition.fat,
            fiber: recipeData.nutrition.fiber,
            carbohydrates: recipeData.nutrition.carbohydrates,
            sugar: recipeData.nutrition.sugar
          }
        }
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
        // Handle ingredients update if provided
        ...(recipeData.ingredients && {
          ingredients: {
            deleteMany: {},
            create: await Promise.all(recipeData.ingredients.map(async (ingredientData) => {
              let ingredient = await prisma.ingredient.findFirst({
                where: { name: ingredientData.name }
              })

              if (!ingredient) {
                ingredient = await prisma.ingredient.create({
                  data: { name: ingredientData.name }
                })
              }

              return {
                ingredient: { connect: { id: ingredient.id } },
                quantity: ingredientData.quantity,
                unit: ingredientData.unit,
                notes: ingredientData.notes
              }
            }))
          }
        }),
        // Handle instructions update if provided
        ...(recipeData.instructions && {
          instructions: {
            deleteMany: {},
            create: recipeData.instructions.map((instruction, index) => ({
              stepNumber: index + 1,
              instruction
            }))
          }
        }),
        // Handle nutrition info update if provided
        ...(recipeData.nutrition && {
          nutritionInfo: {
            update: {
              calories: recipeData.nutrition.calories,
              protein: recipeData.nutrition.protein,
              fat: recipeData.nutrition.fat,
              fiber: recipeData.nutrition.fiber,
              carbohydrates: recipeData.nutrition.carbohydrates,
              sugar: recipeData.nutrition.sugar
            }
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