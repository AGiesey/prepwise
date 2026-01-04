import { Recipe } from '@/types/recipe';
import RecipeForm from '@/components/RecipeForm';
import { RecipeService } from '@/services/recipeService';

async function getRecipe(id: string): Promise<Recipe> {
  try {
    const recipeService = new RecipeService();
    const recipe = await recipeService.getRecipe(id);
    return recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
}

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  return (
    <div className="p-8 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>
        <RecipeForm initialData={recipe} isEditing={true} />
      </div>
    </div>
  );
} 