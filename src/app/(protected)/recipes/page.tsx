import Link from 'next/link';
import { Recipe } from '@/types/recipe';
import { PlusIcon } from '@heroicons/react/24/outline';
import RecipeCard from '@/components/RecipeCard';
import { RecipeService } from '@/services/recipeService';
import logger from '@/utilities/logger';

export const dynamic = 'force-dynamic';

async function getRecipes(): Promise<Recipe[]> {
  try {
    const recipeService = new RecipeService();
    const recipes = await recipeService.getAllRecipes();
    console.log("RECIPES", recipes);
    return recipes;
  } catch (error) {
    logger.error('Error fetching recipes', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <div className="p-8 bg-background">
      <div className="flex justify-start items-center mb-8 ">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <Link 
          href="/recipes/new"
          className="p-1.5 bg-accent-green text-white rounded hover:bg-gray-800 ml-5"
          title="Add new"
        >
          <PlusIcon className="h-5 w-5 " />
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No recipes found. Create your first recipe!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: Recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
} 