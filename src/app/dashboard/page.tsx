import {
  PlusIcon,
  CalendarIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import RecipeStatsWidget from "@/components/widgets/RecipeStatsWidget";
import RecentRecipesWidget from "@/components/widgets/RecentRecipesWidget";
import MealPlanWidget from "@/components/widgets/MealPlanWidget";

export default function DashboardPage() {
  const stats = [
    { label: "Total Recipes", value: 24 },
    { label: "Favorites", value: 8 },
    { label: "This Week", value: 5 },
  ];

  const recentRecipes = [
    { name: "Spaghetti Carbonara", date: "2 days ago" },
    { name: "Chicken Curry", date: "4 days ago" },
    { name: "Vegetable Stir Fry", date: "1 week ago" },
  ];

  const mealPlan = [
    { day: "Monday", meal: "Pasta Primavera" },
    { day: "Wednesday", meal: "Grilled Salmon" },
    { day: "Friday", meal: "Vegetable Curry" },
  ];

  return (
    <div className="p-8 text-black">
      <h1 className="text-3xl font-bold mb-8">Recipe Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecipeStatsWidget stats={stats} />
        <RecentRecipesWidget recipes={recentRecipes} />
        <MealPlanWidget meals={mealPlan} />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Recipe
          </button>
          <button className="px-4 py-2 border border-black rounded hover:bg-gray-100 flex items-center text-black">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Plan Meals
          </button>
          <button className="px-4 py-2 border border-black rounded hover:bg-gray-100 flex items-center text-black">
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Generate Shopping List
          </button>
        </div>
      </div>
    </div>
  );
} 