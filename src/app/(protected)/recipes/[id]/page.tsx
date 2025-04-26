'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import recipesData from '@/data/recipes.json';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Recipe } from '@/types/recipe';

const DIETARY_STYLES = {
  vegetarian: 'bg-green-100 text-green-800',
  vegan: 'bg-green-100 text-green-800',
  glutenFree: 'bg-blue-100 text-blue-800',
  dairyFree: 'bg-blue-100 text-blue-800',
  lowCarb: 'bg-purple-100 text-purple-800',
  highProtein: 'bg-purple-100 text-purple-800'
} as const;

const NUTRITION_LABELS = {
  calories: { label: 'Calories', unit: '' },
  protein: { label: 'Protein', unit: 'g' },
  fat: { label: 'Fat', unit: 'g' },
  fiber: { label: 'Fiber', unit: 'g' },
  carbohydrates: { label: 'Carbs', unit: 'g' },
  sugar: { label: 'Sugar', unit: 'g' }
} as const;

// Create a cache for recipe promises
const recipeCache = new Map<string, Promise<Recipe>>();

// Function to get or create a cached recipe promise
function getRecipe(id: string) {
  if (!recipeCache.has(id)) {
    const recipe = recipesData.recipes.find(r => r.id === id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    recipeCache.set(id, Promise.resolve(recipe));
  }
  return recipeCache.get(id)!;
}

export default function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  // First unwrap the params Promise
  const { id } = use(params);
  // Then use the unwrapped id to fetch the recipe from cache
  const recipe = use(getRecipe(id));

  return (
    <div className="p-8 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-gray-600 mb-8">{recipe.description}</p>

        <div className="flex gap-4 mb-6">
          <div className="bg-gray-100 px-4 py-2 rounded">
            <span className="font-semibold">Yield:</span> {recipe.yield}
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded">
            <span className="font-semibold">Total Time:</span> {recipe.totalTime} minutes
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient: Recipe['ingredients'][0], index: number) => (
                <li key={index} className="flex items-center">
                  <span className="font-medium">
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    {ingredient.notes && ` (${ingredient.notes})`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex gap-2">
                  <span className="font-bold">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Nutrition Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(recipe.nutrition).map(([key, value]) => (
              <div key={key} className="bg-gray-100 p-4 rounded">
                <div className="font-semibold">{NUTRITION_LABELS[key as keyof typeof NUTRITION_LABELS].label}</div>
                <div>{value}{NUTRITION_LABELS[key as keyof typeof NUTRITION_LABELS].unit}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Dietary Information</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(recipe.dietary).map(([key, value]) => 
              value && (
                <span 
                  key={key}
                  className={`px-3 py-1 rounded-full text-sm ${DIETARY_STYLES[key as keyof typeof DIETARY_STYLES]}`}
                >
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              )
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag: string, index: number) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 