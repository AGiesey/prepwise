import { Recipe } from '@/types/recipe';
import RecipeForm from '@/components/RecipeForm';

async function getRecipe(id: string): Promise<Recipe> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/recipes/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipe');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
}

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);

  return (
    <div className="p-8 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>
        <RecipeForm initialData={recipe} isEditing={true} />
      </div>
    </div>
  );
} 