export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  fiber: number;
  carbohydrates: number;
  sugar: number;
}

export interface Recipe {
  id?: string;
  title: string;
  description: string;
  yield: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  dietary: Record<string, boolean>;
  tags: string[];
}