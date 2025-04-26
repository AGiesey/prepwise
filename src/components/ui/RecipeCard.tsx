import Link from 'next/link';
import { Recipe } from '@/types/recipe';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link 
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
  );
} 