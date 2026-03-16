'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Recipe } from '@/types/recipe';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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

function RecipeLoadingSkeleton() {
  return (
    <div className="p-8 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipe = useCallback(async () => {
    try {
      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }
      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      router.push('/recipes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  if (loading) {
    return <RecipeLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 bg-white text-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-8 bg-white text-black">
        <div className="max-w-4xl mx-auto">
          <div>Recipe not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-start items-center mb-8">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <div className="flex gap-2 ml-5">
            <button
              onClick={() => router.push(`/recipes/${id}/edit`)}
              className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 cursor-pointer"
              title="Edit recipe"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 cursor-pointer"
              title="Delete recipe"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

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
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="font-medium">
                    {[ingredient.quantity, ingredient.unit, ingredient.name].filter(Boolean).join(' ')}
                    {ingredient.notes && ` (${ingredient.notes})`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
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
            {Object.entries(recipe.nutrition)
              .filter(([key]) => key in NUTRITION_LABELS)
              .map(([key, value]) => (
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
                  className={`px-3 py-1 rounded-full text-sm ${DIETARY_STYLES[key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) as keyof typeof DIETARY_STYLES]}`}
                >
                  {key.replace(/-/g, ' ')}
                </span>
              )
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag, index) => (
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