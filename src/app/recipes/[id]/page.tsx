import { Recipe } from '@/types/recipe';
import recipesData from '@/data/recipes.json';

const DIETARY_COLORS = {
  vegetarian: 'green',
  vegan: 'green',
  glutenFree: 'blue',
  dairyFree: 'blue',
  lowCarb: 'purple',
  highProtein: 'purple'
} as const;

const NUTRITION_LABELS = {
  calories: { label: 'Calories', unit: '' },
  protein: { label: 'Protein', unit: 'g' },
  fat: { label: 'Fat', unit: 'g' },
  fiber: { label: 'Fiber', unit: 'g' },
  carbohydrates: { label: 'Carbs', unit: 'g' },
  sugar: { label: 'Sugar', unit: 'g' }
} as const;

interface RecipePageProps {
  params: {
    id: string;
  };
}

export default function RecipePage({ params }: RecipePageProps) {
  const recipe = recipesData.recipes.find((r: Recipe) => r.id === params.id);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Recipe not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 mx-auto">
      <div className="mb-8">
        {/* {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-96 object-cover rounded-lg mb-4"
          />
        )} */}
        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-lg mb-4">{recipe.description}</p>
        
        <div className="flex gap-4 mb-6">
          <div className="bg-gray-100 px-4 py-2 rounded">
            <span className="font-semibold">Yield:</span> {recipe.yield}
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded">
            <span className="font-semibold">Total Time:</span> {recipe.totalTime} minutes
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
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
          <h2 className="text-2xl font-bold mb-4">Instructions</h2>
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
        <h2 className="text-2xl font-bold mb-4">Nutrition Information</h2>
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
        <h2 className="text-2xl font-bold mb-4">Dietary Information</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(recipe.dietary).map(([key, value]) => 
            value && (
              <span 
                key={key}
                className={`dietary-badge bg-${DIETARY_COLORS[key as keyof typeof DIETARY_COLORS]}-100 text-${DIETARY_COLORS[key as keyof typeof DIETARY_COLORS]}-800`}
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            )
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 