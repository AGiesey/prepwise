import Link from 'next/link';
import { Recipe } from '@/types/recipe';
import { PlusIcon } from '@heroicons/react/24/outline';
import RecipeCard from '@/components/RecipeCard';
import { RecipeService } from '@/services/recipeService';

export const dynamic = 'force-dynamic';

async function getRecipes(): Promise<Recipe[]> {
  try {
    console.log('[RecipesPage] Fetching recipes from service...');
    const recipeService = new RecipeService();
    const recipes = await recipeService.getAllRecipes();
    console.log('[RecipesPage] Successfully fetched recipes:', recipes.length);
    console.log('[RecipesPage] Recipes data:', JSON.stringify(recipes, null, 2));
    console.log('[RecipesPage] First recipe sample:', recipes[0] ? JSON.stringify(recipes[0], null, 2) : 'No recipes');
    return recipes;
  } catch (error) {
    console.error('[RecipesPage] Error fetching recipes:', error);
    if (error instanceof Error) {
      console.error('[RecipesPage] Error message:', error.message);
      console.error('[RecipesPage] Error stack:', error.stack);
    }
    return [];
  }
}

export default async function RecipesPage() {
  console.log('[RecipesPage] ===== PAGE RENDERING STARTED =====');
  try {
    const recipes = await getRecipes();
    console.log('[RecipesPage] Rendering with', recipes.length, 'recipes');
    console.log('[RecipesPage] Recipes array length:', recipes.length);
    if (recipes.length > 0) {
      console.log('[RecipesPage] First recipe ID:', recipes[0].id);
      console.log('[RecipesPage] First recipe title:', recipes[0].title);
    }

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

      {/* DEBUG: Show count */}
      <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-sm text-yellow-800">
          DEBUG: recipes.length = {recipes.length} | Timestamp: {new Date().toISOString()}
        </p>
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
  } catch (error) {
    console.error('[RecipesPage] ===== PAGE RENDERING ERROR =====', error);
    throw error;
  }
} 