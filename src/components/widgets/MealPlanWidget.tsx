import BaseWidget from './BaseWidget';

interface MealItem {
  day: string;
  meal: string;
}

interface MealPlanWidgetProps {
  meals: MealItem[];
}

export default function MealPlanWidget({ meals }: MealPlanWidgetProps) {
  return (
    <BaseWidget title="This Week's Plan">
      <div className="space-y-3">
        {meals.map((meal, index) => (
          <div key={index} className="flex items-center justify-between">
            <span>{meal.day}</span>
            <span>{meal.meal}</span>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
} 