'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Recipe } from '@/types/recipe';

interface RecipeFormProps {
  initialData?: Recipe;
  isEditing?: boolean;
}

export default function RecipeForm({ initialData, isEditing = false }: RecipeFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Recipe>>(initialData || {
    title: '',
    description: '',
    yield: '',
    prepTime: 0,
    cookTime: 0,
    totalTime: 0,
    ingredients: [],
    instructions: [],
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
      carbohydrates: 0,
      sugar: 0
    },
    dietary: {},
    tags: []
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [instructionInput, setInstructionInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? `/api/recipes/${initialData?.id}` : '/api/recipes';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      router.push('/recipes');
      router.refresh();
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), {
          name: ingredientInput,
          quantity: 1,
          unit: 'unit',
          notes: ''
        }]
      }));
      setIngredientInput('');
    }
  };

  const addInstruction = () => {
    if (instructionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        instructions: [...(prev.instructions || []), instructionInput]
      }));
      setInstructionInput('');
    }
  };

  const updateNutrition = (field: keyof Recipe['nutrition'], value: number) => {
    setFormData(prev => ({
      ...prev,
      nutrition: {
        calories: prev.nutrition?.calories || 0,
        protein: prev.nutrition?.protein || 0,
        fat: prev.nutrition?.fat || 0,
        fiber: prev.nutrition?.fiber || 0,
        carbohydrates: prev.nutrition?.carbohydrates || 0,
        sugar: prev.nutrition?.sugar || 0,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Yield</label>
          <input
            type="text"
            value={formData.yield}
            onChange={(e) => setFormData(prev => ({ ...prev, yield: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Prep Time (minutes)</label>
            <input
              type="number"
              value={formData.prepTime}
              onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Cook Time (minutes)</label>
            <input
              type="number"
              value={formData.cookTime}
              onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Total Time (minutes)</label>
            <input
              type="number"
              value={formData.totalTime}
              onChange={(e) => setFormData(prev => ({ ...prev, totalTime: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ingredients</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Add ingredient"
            />
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {formData.ingredients?.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => {
                    const newIngredients = [...(formData.ingredients || [])];
                    newIngredients[index].quantity = parseFloat(e.target.value);
                    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                  }}
                  className="w-20 p-2 border rounded"
                />
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => {
                    const newIngredients = [...(formData.ingredients || [])];
                    newIngredients[index].unit = e.target.value;
                    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                  }}
                  className="w-20 p-2 border rounded"
                />
                <span className="flex-1">{ingredient.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newIngredients = [...(formData.ingredients || [])];
                    newIngredients.splice(index, 1);
                    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Instructions</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={instructionInput}
              onChange={(e) => setInstructionInput(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Add instruction"
            />
            <button
              type="button"
              onClick={addInstruction}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Add
            </button>
          </div>
          <ol className="space-y-2">
            {formData.instructions?.map((instruction, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="font-bold">{index + 1}.</span>
                <span className="flex-1">{instruction}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newInstructions = [...(formData.instructions || [])];
                    newInstructions.splice(index, 1);
                    setFormData(prev => ({ ...prev, instructions: newInstructions }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Calories</label>
            <input
              type="number"
              value={formData.nutrition?.calories || 0}
              onChange={(e) => updateNutrition('calories', parseInt(e.target.value))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Protein (g)</label>
            <input
              type="number"
              value={formData.nutrition?.protein || 0}
              onChange={(e) => updateNutrition('protein', parseInt(e.target.value))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/recipes')}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            {isEditing ? 'Update Recipe' : 'Create Recipe'}
          </button>
        </div>
      </div>
    </form>
  );
} 