export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  fiber: number;
  carbohydrates: number;
  sugar: number;
}

export interface Dietary {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  lowCarb: boolean;
  highProtein: boolean;
}

export interface Recipe {
    id: string;
    title: string;
    description: string;
    yield: string;
    prepTime?: number;
    cookTime?: number;
    totalTime: number;
    ingredients: Ingredient[];
    instructions: string[];
    dietary: Dietary;
    nutrition: Nutrition;
    tags: string[];
    imageUrl?: string;
    sourceUrl?: string;
}