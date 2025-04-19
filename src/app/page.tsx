import Image from "next/image";
import {
  PlusIcon,
  CalendarIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Recipe Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recipe Stats Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Recipe Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Recipes</span>
              <span className="font-bold">24</span>
            </div>
            <div className="flex justify-between">
              <span>Favorites</span>
              <span className="font-bold">8</span>
            </div>
            <div className="flex justify-between">
              <span>This Week</span>
              <span className="font-bold">5</span>
            </div>
          </div>
        </div>

        {/* Recent Recipes Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Recent Recipes</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Spaghetti Carbonara</span>
              <span className="text-sm text-gray-500">2 days ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Chicken Curry</span>
              <span className="text-sm text-gray-500">4 days ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Vegetable Stir Fry</span>
              <span className="text-sm text-gray-500">1 week ago</span>
            </div>
          </div>
        </div>

        {/* Meal Plan Preview */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">This Week's Plan</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Monday</span>
              <span>Pasta Primavera</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Wednesday</span>
              <span>Grilled Salmon</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Friday</span>
              <span>Vegetable Curry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Recipe
          </button>
          <button className="px-4 py-2 border border-black rounded hover:bg-gray-100 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Plan Meals
          </button>
          <button className="px-4 py-2 border border-black rounded hover:bg-gray-100 flex items-center">
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Generate Shopping List
          </button>
        </div>
      </div>
    </div>
  );
}
