import Link from 'next/link';
import recipesData from '@/data/recipes.json';

export default function RecipesPage() {
  return (
    <div className="p-8 bg-white text-black">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
          Add New Recipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipesData.recipes.map((recipe) => (
          <Link 
            key={recipe.id} 
            href={`/recipes/${recipe.id}`}
            className="block p-6 border border-gray-200 rounded-lg hover:border-black transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">{recipe.title}</h2>
            <p className="text-gray-600 mb-4">{recipe.description}</p>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 