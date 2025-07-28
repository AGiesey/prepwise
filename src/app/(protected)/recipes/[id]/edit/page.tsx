import { Recipe } from '@/types/recipe';
import RecipeForm from '@/components/RecipeForm';

async function getRecipe(id: string): Promise<Recipe> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${id}`, {
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