'use client';

import { useRouter } from 'next/navigation';
import { CreateRecipeDTO } from '@/types/dtos';

interface ChatFormProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  recipeData?: CreateRecipeDTO | null;
  onRecipeDataClear: () => void;
}

export default function ChatForm({ message, onMessageChange, onSubmit, recipeData, onRecipeDataClear }: ChatFormProps) {
  const router = useRouter();

  const handleGoToRecipe = () => {
    if (recipeData) {
      // Store recipe data in sessionStorage to pass to the recipe form
      sessionStorage.setItem('newRecipeData', JSON.stringify(recipeData));
      // Navigate to recipe creation page
      router.push('/recipes/new');
      // Clear recipe data from chat
      onRecipeDataClear();
    }
  };

  const createRecipeSummary = (recipe: CreateRecipeDTO): string => {
    const ingredientsCount = recipe.ingredients?.length || 0;
    const instructionsCount = recipe.instructions?.length || 0;
    const timeStr = recipe.totalTime ? ` (Total: ${recipe.totalTime} min)` : '';
    const prepStr = recipe.prepTime ? ` Prep: ${recipe.prepTime} min` : '';
    const cookStr = recipe.cookTime ? ` Cook: ${recipe.cookTime} min` : '';
    
    let summary = `I've created a recipe for **${recipe.title}**!\n\n`;
    summary += `📝 **Description:** ${recipe.description || 'No description provided'}\n\n`;
    summary += `⏱️ **Time:**${prepStr}${cookStr}${timeStr}\n\n`;
    summary += `👥 **Yield:** ${recipe.yield || 'Not specified'}\n\n`;
    summary += `🥘 **Ingredients:** ${ingredientsCount} ingredient${ingredientsCount !== 1 ? 's' : ''}\n\n`;
    summary += `📋 **Instructions:** ${instructionsCount} step${instructionsCount !== 1 ? 's' : ''}\n\n`;
    
    if (recipe.tags && recipe.tags.length > 0) {
      summary += `🏷️ **Tags:** ${recipe.tags.join(', ')}\n\n`;
    }
    
    summary += `Would you like to add this recipe to your collection?`;
    
    return summary;
  };

  return (
    <div className="border-t-2 border-gray-200">
      {/* Hidden section for recipe creation */}
      {recipeData && (
        <div className="p-4 bg-gray-50 border-b-2 border-gray-200">
          <div className="mb-4">
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {createRecipeSummary(recipeData)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleGoToRecipe}
            className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer"
          >
            Go
          </button>
        </div>
      )}
      
      <div className="p-4">
        <form onSubmit={onSubmit} className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border-2 border-gray-300 rounded-l focus:outline-none text-black placeholder-gray-500 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-r hover:bg-gray-800 transition-colors duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 