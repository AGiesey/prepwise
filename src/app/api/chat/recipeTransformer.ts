type RecipeForChat = {
  title: string;
  description: string;
  yield: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  ingredients: Array<{
    ingredient: { name: string };
    quantity: number;
    unit: string;
    notes: string | null;
  }>;
  instructions: Array<{
    instruction: string;
    stepNumber: number;
  }>;
  nutritionInfo: {
    calories: number;
    protein: number;
    fat: number;
    fiber: number;
    carbohydrates: number;
    sugar: number;
  } | null;
  dietaryRestrictions: Array<{
    dietaryRestriction: { name: string };
  }>;
};

export function transformRecipeForChat(recipe: RecipeForChat): string {
  const parts: string[] = [];

  // Basic recipe information
  parts.push(`Recipe: ${recipe.title}; Description: ${recipe.description}; Yield: ${recipe.yield}; Prep Time: ${recipe.prepTime} minutes; Cook Time: ${recipe.cookTime} minutes; Total Time: ${recipe.totalTime} minutes`);

  // Ingredients
  const ingredients = recipe.ingredients.map(({ ingredient, quantity, unit, notes }) => {
    const noteStr = notes ? ` (${notes})` : '';
    return `${quantity} ${unit} ${ingredient.name}${noteStr}`;
  });
  parts.push(`Ingredients: ${ingredients.join(', ')}`);

  // Instructions
  const instructions = recipe.instructions
    .sort((a, b) => a.stepNumber - b.stepNumber)
    .map(({ instruction }) => instruction);
  parts.push(`Instructions: ${instructions.join('; ')}`);

  // Nutrition Information
  if (recipe.nutritionInfo) {
    const { calories, protein, fat, fiber, carbohydrates, sugar } = recipe.nutritionInfo;
    parts.push(`Nutrition: ${calories} calories, ${protein}g protein, ${fat}g fat, ${fiber}g fiber, ${carbohydrates}g carbs, ${sugar}g sugar`);
  }

  // Dietary Restrictions
  if (recipe.dietaryRestrictions.length > 0) {
    const restrictions = recipe.dietaryRestrictions.map(({ dietaryRestriction }) => dietaryRestriction.name);
    parts.push(`Dietary Restrictions: ${restrictions.join(', ')}`);
  }

  return parts.join('; ');
} 