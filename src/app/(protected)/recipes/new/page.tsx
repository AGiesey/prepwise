'use client';

import { useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import { Recipe } from '@/types/recipe';
import { CreateRecipeDTO } from '@/types/dtos';

// Read from sessionStorage once during component initialization
function getInitialRecipeData(): Recipe | undefined {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const storedData = sessionStorage.getItem('newRecipeData');
    if (storedData) {
      const recipeData = JSON.parse(storedData) as CreateRecipeDTO;
      // Clear the stored data after reading it
      sessionStorage.removeItem('newRecipeData');
      // Convert CreateRecipeDTO to Recipe format (they're compatible)
      return {
        ...recipeData,
        id: recipeData.id // May be undefined, which is fine for new recipes
      } as Recipe;
    }
  } catch (error) {
    console.error('Error parsing recipe data from sessionStorage:', error);
  }
  return undefined;
}

export default function NewRecipePage() {
  // Read from sessionStorage once during initialization
  const [initialData] = useState<Recipe | undefined>(getInitialRecipeData);

  return (
    <div className="min-h-screen bg-gray-50">
      <RecipeForm initialData={initialData} />
    </div>
  );
} 