/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecipeService } from '../recipeService';
import { CreateRecipeDTO } from '@/types/dtos';
import mockRecipesData from './mockRecipes.json';
import { prisma } from '@/lib/db';


// Mock the Prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    $connect: jest.fn().mockResolvedValue(undefined),
    recipe: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ingredient: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('RecipeService', () => {
  let recipeService: RecipeService;
  let mockPrisma: any;

  beforeEach(() => {
    recipeService = new RecipeService();
    mockPrisma = prisma;
    jest.clearAllMocks();
  });

  describe('createRecipe', () => {
    const mockCreateRecipeData: CreateRecipeDTO = {
      title: 'Test Recipe',
      description: 'A test recipe',
      yield: '4 servings',
      prepTime: 15,
      cookTime: 30,
      totalTime: 45,
      ingredients: [
        { name: 'Flour', quantity: 2, unit: 'cups', notes: 'All-purpose' },
        { name: 'Sugar', quantity: 1, unit: 'cup' }
      ],
      instructions: [
        'Mix flour and sugar',
        'Bake at 350F for 30 minutes'
      ],
      nutrition: {
        calories: 300,
        protein: 5,
        fat: 10,
        fiber: 2,
        carbohydrates: 50,
        sugar: 25
      },
      dietary: {},
      tags: []
    };

    const mockIngredient1 = { id: 'ingredient-1', name: 'Flour' };
    const mockIngredient2 = { id: 'ingredient-2', name: 'Sugar' };

    const mockCreatedRecipe = {
      id: 'recipe-1',
      title: 'Test Recipe',
      description: 'A test recipe',
      yield: '4 servings',
      prepTime: 15,
      cookTime: 30,
      totalTime: 45,
      ingredients: [
        {
          ingredient: mockIngredient1,
          quantity: 2,
          unit: 'cups',
          notes: 'All-purpose'
        },
        {
          ingredient: mockIngredient2,
          quantity: 1,
          unit: 'cup',
          notes: null
        }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Mix flour and sugar' },
        { stepNumber: 2, instruction: 'Bake at 350F for 30 minutes' }
      ],
      nutritionInfo: {
        calories: 300,
        protein: 5,
        fat: 10,
        fiber: 2,
        carbohydrates: 50,
        sugar: 25
      },
      dietaryRestrictions: []
    };

    it('should create a recipe with new ingredients', async () => {
      // Mock ingredient lookups - both ingredients don't exist
      mockPrisma.ingredient.findFirst
        .mockResolvedValueOnce(null) // Flour doesn't exist
        .mockResolvedValueOnce(null); // Sugar doesn't exist

      // Mock ingredient creation
      mockPrisma.ingredient.create
        .mockResolvedValueOnce(mockIngredient1)
        .mockResolvedValueOnce(mockIngredient2);

      // Mock recipe creation
      mockPrisma.recipe.create.mockResolvedValue(mockCreatedRecipe as any);

      const result = await recipeService.createRecipe(mockCreateRecipeData);

      expect(mockPrisma.ingredient.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrisma.ingredient.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.recipe.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Recipe',
          description: 'A test recipe',
          yield: '4 servings',
          prepTime: 15,
          cookTime: 30,
          totalTime: 45,
          ingredients: {
            create: [
              {
                ingredient: { connect: { id: 'ingredient-1' } },
                quantity: 2,
                unit: 'cups',
                notes: 'All-purpose'
              },
              {
                ingredient: { connect: { id: 'ingredient-2' } },
                quantity: 1,
                unit: 'cup',
                notes: undefined
              }
            ]
          },
          instructions: {
            create: [
              { stepNumber: 1, instruction: 'Mix flour and sugar' },
              { stepNumber: 2, instruction: 'Bake at 350F for 30 minutes' }
            ]
          },
          nutritionInfo: {
            create: {
              calories: 300,
              protein: 5,
              fat: 10,
              fiber: 2,
              carbohydrates: 50,
              sugar: 25
            }
          }
        },
        include: {
          ingredients: { include: { ingredient: true } },
          instructions: true,
          nutritionInfo: true,
          dietaryRestrictions: { include: { dietaryRestriction: true } }
        }
      });

      expect(result).toEqual({
        id: 'recipe-1',
        title: 'Test Recipe',
        description: 'A test recipe',
        yield: '4 servings',
        prepTime: 15,
        cookTime: 30,
        totalTime: 45,
        ingredients: [
          { name: 'Flour', quantity: 2, unit: 'cups', notes: 'All-purpose' },
          { name: 'Sugar', quantity: 1, unit: 'cup', notes: undefined }
        ],
        instructions: ['Mix flour and sugar', 'Bake at 350F for 30 minutes'],
        nutrition: {
          calories: 300,
          protein: 5,
          fat: 10,
          fiber: 2,
          carbohydrates: 50,
          sugar: 25
        },
        dietary: {},
        tags: []
      });
    });

    it('should create a recipe with existing ingredients', async () => {
      // Mock ingredient lookups - both ingredients exist
      mockPrisma.ingredient.findFirst
        .mockResolvedValueOnce(mockIngredient1)
        .mockResolvedValueOnce(mockIngredient2);

      // Mock recipe creation
      mockPrisma.recipe.create.mockResolvedValue(mockCreatedRecipe as any);

      const result = await recipeService.createRecipe(mockCreateRecipeData);

      expect(mockPrisma.ingredient.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrisma.ingredient.create).not.toHaveBeenCalled();
      expect(mockPrisma.recipe.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getRecipe', () => {
    const mockRecipe = (mockRecipesData as any[]).find(r => r.id === 'test-recipe-1');

    it('should return a recipe when found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(mockRecipe as any);

      const result = await recipeService.getRecipe('test-recipe-1');

      expect(mockPrisma.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-recipe-1' },
        include: expect.any(Object)
      });
      expect(result).toEqual({
        id: 'test-recipe-1',
        title: 'Test Recipe',
        description: 'A test recipe',
        yield: '4 servings',
        prepTime: 15,
        cookTime: 30,
        totalTime: 45,
        ingredients: [
          { name: 'Flour', quantity: 2, unit: 'cups', notes: 'All-purpose' }
        ],
        instructions: ['Mix ingredients'],
        nutrition: {
          calories: 300,
          protein: 5,
          fat: 10,
          fiber: 2,
          carbohydrates: 50,
          sugar: 25
        },
        dietary: {},
        tags: []
      });
    });

    it('should throw error when recipe not found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(null);

      await expect(recipeService.getRecipe('non-existent')).rejects.toThrow('Recipe not found');
    });
  });

  describe('getAllRecipes', () => {
    const mockRecipes = (mockRecipesData as any[]).filter(r => r.id === 'recipe-1' || r.id === 'recipe-2');

    it('should return all recipes', async () => {
      mockPrisma.recipe.findMany.mockResolvedValue(mockRecipes);

      const result = await recipeService.getAllRecipes();

      expect(mockPrisma.recipe.findMany).toHaveBeenCalledWith({
        include: expect.any(Object)
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'recipe-1',
        title: 'Recipe 1',
        description: 'First recipe',
        yield: '2 servings',
        prepTime: 10,
        cookTime: 20,
        totalTime: 30,
        ingredients: [
          { name: 'Ingredient 1', quantity: 1, unit: 'cup', notes: undefined }
        ],
        instructions: ['Step 1'],
        nutrition: {
          calories: 200,
          protein: 3,
          fat: 5,
          fiber: 1,
          carbohydrates: 30,
          sugar: 15
        },
        dietary: {},
        tags: []
      });
    });

    it('should return empty array when no recipes exist', async () => {
      mockPrisma.recipe.findMany.mockResolvedValue([]);

      const result = await recipeService.getAllRecipes();

      expect(result).toEqual([]);
    });
  });

  describe('updateRecipe', () => {
    const mockExistingRecipe = {
      id: 'recipe-1',
      title: 'Original Recipe',
      description: 'Original description',
      yield: '2 servings',
      prepTime: 10,
      cookTime: 20,
      totalTime: 30,
      ingredients: [
        {
          ingredient: { name: 'Original Ingredient' },
          quantity: 1,
          unit: 'cup',
          notes: null
        }
      ],
      instructions: [
        { instruction: 'Original step' }
      ],
      nutritionInfo: {
        calories: 200,
        protein: 3,
        fat: 5,
        fiber: 1,
        carbohydrates: 30,
        sugar: 15
      },
      dietaryRestrictions: []
    };

    const mockUpdatedRecipe = {
      ...mockExistingRecipe,
      title: 'Updated Recipe',
      description: 'Updated description'
    };

    it('should update recipe when found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(mockExistingRecipe as any);
      mockPrisma.recipe.update.mockResolvedValue(mockUpdatedRecipe as any);

      const updateData = {
        title: 'Updated Recipe',
        description: 'Updated description'
      };

      const result = await recipeService.updateRecipe('recipe-1', updateData);

      expect(mockPrisma.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'recipe-1' },
        include: expect.any(Object)
      });
      expect(mockPrisma.recipe.update).toHaveBeenCalledWith({
        where: { id: 'recipe-1' },
        data: {
          title: 'Updated Recipe',
          description: 'Updated description',
          yield: undefined,
          prepTime: undefined,
          cookTime: undefined,
          totalTime: undefined
        },
        include: expect.any(Object)
      });
      expect(result).toBeDefined();
    });

    it('should throw error when recipe not found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(null);

      await expect(recipeService.updateRecipe('non-existent', {})).rejects.toThrow('Recipe not found');
    });

    it('should update ingredients when provided', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(mockExistingRecipe as any);
      mockPrisma.recipe.update.mockResolvedValue(mockUpdatedRecipe as any);
      mockPrisma.ingredient.findFirst.mockResolvedValue({ id: 'ingredient-1', name: 'New Ingredient' });

      const updateData = {
        ingredients: [
          { name: 'New Ingredient', quantity: 2, unit: 'tbsp' }
        ]
      };

      await recipeService.updateRecipe('recipe-1', updateData);

      expect(mockPrisma.recipe.update).toHaveBeenCalledWith({
        where: { id: 'recipe-1' },
        data: expect.objectContaining({
          ingredients: {
            deleteMany: {},
            create: expect.arrayContaining([
              expect.objectContaining({
                ingredient: { connect: { id: 'ingredient-1' } },
                quantity: 2,
                unit: 'tbsp'
              })
            ])
          }
        }),
        include: expect.any(Object)
      });
    });
  });

  describe('deleteRecipe', () => {
    it('should delete recipe when found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue({ id: 'recipe-1' } as any);
      mockPrisma.recipe.delete.mockResolvedValue({} as any);

      const result = await recipeService.deleteRecipe('recipe-1');

      expect(mockPrisma.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'recipe-1' }
      });
      expect(mockPrisma.recipe.delete).toHaveBeenCalledWith({
        where: { id: 'recipe-1' }
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw error when recipe not found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(null);

      await expect(recipeService.deleteRecipe('non-existent')).rejects.toThrow('Recipe not found');
    });
  });

  describe('getRecipeContextForChat', () => {
    const mockChatRecipe = {
      id: 'recipe-1',
      title: 'Chat Recipe',
      description: 'Recipe for chat context',
      yield: '2 servings',
      prepTime: 10,
      cookTime: 20,
      totalTime: 30,
      ingredients: [
        {
          ingredient: { name: 'Chat Ingredient' },
          quantity: 1,
          unit: 'cup',
          notes: null
        }
      ],
      instructions: [
        { instruction: 'Chat step', stepNumber: 1 }
      ],
      nutritionInfo: {
        calories: 200,
        protein: 3,
        fat: 5,
        fiber: 1,
        carbohydrates: 30,
        sugar: 15
      },
      dietaryRestrictions: []
    };

    it('should return recipe context for chat', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(mockChatRecipe as any);

      const result = await recipeService.getRecipeContextForChat('recipe-1');

      expect(mockPrisma.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'recipe-1' },
        include: expect.any(Object)
      });
      expect(result).toEqual(mockChatRecipe);
    });

    it('should return null when recipe not found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(null);

      const result = await recipeService.getRecipeContextForChat('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('formatRecipeForResponse', () => {
    it('should throw error when recipe has no nutrition info', () => {
      const recipeWithoutNutrition = {
        id: 'recipe-1',
        title: 'Test Recipe',
        description: 'Test description',
        yield: '2 servings',
        prepTime: 10,
        cookTime: 20,
        totalTime: 30,
        ingredients: [],
        instructions: [],
        nutritionInfo: null,
        dietaryRestrictions: []
      };

      // Access private method through any
      const service = recipeService as any;
      expect(() => service.formatRecipeForResponse(recipeWithoutNutrition)).toThrow('Recipe must have nutrition info');
    });
  });
}); 