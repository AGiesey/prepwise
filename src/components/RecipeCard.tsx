'use client';

import Link from 'next/link';
import { Recipe } from '@/types/recipe';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const handleDelete = async () => {
    // TODO: Implement delete functionality
    console.log('Delete recipe:', recipe.id);
  };

  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:border-black transition-colors">
      <Link href={`/recipes/${recipe.id}`} className="block">
        <h2 className="text-xl font-semibold mb-2">{recipe.title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag: string, index: number) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
      
      <div className="flex justify-end gap-2 mt-4">
        <Link
          href={`/recipes/${recipe.id}/edit`}
          className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          title="Edit recipe"
        >
          <PencilIcon className="h-4 w-4" />
        </Link>
        <button
          onClick={handleDelete}
          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
          title="Delete recipe"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 