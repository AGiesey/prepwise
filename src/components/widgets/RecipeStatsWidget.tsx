import BaseWidget from './BaseWidget';

interface StatItem {
  label: string;
  value: number;
}

interface RecipeStatsWidgetProps {
  stats: StatItem[];
}

export default function RecipeStatsWidget({ stats }: RecipeStatsWidgetProps) {
  return (
    <BaseWidget title="Recipe Stats">
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between">
            <span>{stat.label}</span>
            <span className="font-bold">{stat.value}</span>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
} 