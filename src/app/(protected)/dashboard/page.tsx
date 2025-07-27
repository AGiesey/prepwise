import RecipeStatsWidget from "@/components/widgets/RecipeStatsWidget";
import RecentRecipesWidget from "@/components/widgets/RecentRecipesWidget";
import MealPlanWidget from "@/components/widgets/MealPlanWidget";
import QuickActionsWidget from "@/components/widgets/QuickActionsWidget";
import UserProfile from "@/components/UserProfile";

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
      <h1 className="text-3xl font-bold mb-8">My Kitchen</h1>
      
      <div className="space-y-6">
        {/* Main widget cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RecipeStatsWidget stats={stats} />
          <RecentRecipesWidget recipes={recentRecipes} />
          <MealPlanWidget meals={mealPlan} />
        </div>
        
        {/* User Profile - full width */}
        <UserProfile />
        
        {/* Quick Actions */}
        <QuickActionsWidget />
      </div>
    </div>
  );
} 