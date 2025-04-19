import BaseWidget from './BaseWidget';

interface RecipeItem {
  name: string;
  date: string;
}

interface RecentRecipesWidgetProps {
  recipes: RecipeItem[];
}

export default function RecentRecipesWidget({ recipes }: RecentRecipesWidgetProps) {
  return (
    <BaseWidget title="Recent Recipes">
      <div className="space-y-3">
        {recipes.map((recipe, index) => (
          <div key={index} className="flex items-center justify-between">
            <span>{recipe.name}</span>
            <span className="text-sm text-gray-500">{recipe.date}</span>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
} 