'use client';
import { 
  DocumentPlusIcon, 
  CalendarDaysIcon, 
  ClipboardDocumentListIcon 
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function QuickActionsWidget() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
        <Button 
          className="inline-flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
          onClick={() => router.push('/recipes/new')}
        >
          <DocumentPlusIcon className="h-5 w-5 mr-2" />
          Add New Recipe
        </Button>
        <Button variant="outline">
          <CalendarDaysIcon className="h-5 w-5 mr-2" />
          Plan Meals
        </Button>
        <Button variant="outline">
          <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
          Generate Shopping List
        </Button>
      </div>
    </div>
  );
} 