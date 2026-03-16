'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Recipe, NutritionInfo } from '@/types/recipe';

const DIETARY_OPTIONS = [
  'gluten-free',
  'vegan',
  'vegetarian',
  'dairy-free',
  'nut-free',
  'egg-free',
  'soy-free',
];

const NUTRITION_FIELDS: [keyof NutritionInfo, string][] = [
  ['calories', 'Calories'],
  ['protein', 'Protein (g)'],
  ['fat', 'Fat (g)'],
  ['carbohydrates', 'Carbohydrates (g)'],
  ['fiber', 'Fiber (g)'],
  ['sugar', 'Sugar (g)'],
];

interface RecipeFormProps {
  initialData?: Recipe;
  isEditing?: boolean;
}

const emptyForm: Partial<Recipe> = {
  title: '',
  description: '',
  yield: '',
  prepTime: 0,
  cookTime: 0,
  totalTime: 0,
  ingredients: [],
  instructions: [],
  nutrition: { calories: 0, protein: 0, fat: 0, fiber: 0, carbohydrates: 0, sugar: 0 },
  dietary: {},
  tags: [],
};

export default function RecipeForm({ initialData, isEditing = false }: RecipeFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Recipe>>(initialData || emptyForm);
  const [newIngredient, setNewIngredient] = useState({ quantity: 1, unit: '', name: '' });
  const [newInstruction, setNewInstruction] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleTimeChange = (field: 'prepTime' | 'cookTime' | 'totalTime', value: number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field !== 'totalTime') {
        updated.totalTime =
          (field === 'prepTime' ? value : prev.prepTime || 0) +
          (field === 'cookTime' ? value : prev.cookTime || 0);
      }
      return updated;
    });
  };

  const addIngredient = () => {
    if (!newIngredient.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...(prev.ingredients || []),
        { name: newIngredient.name.trim(), quantity: newIngredient.quantity, unit: newIngredient.unit.trim(), notes: '' },
      ],
    }));
    setNewIngredient({ quantity: 1, unit: '', name: '' });
  };

  const updateIngredient = (index: number, field: 'name' | 'quantity' | 'unit', value: string | number) => {
    const updated = [...(formData.ingredients || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: updated }));
  };

  const removeIngredient = (index: number) => {
    const updated = [...(formData.ingredients || [])];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, ingredients: updated }));
  };

  const addInstruction = () => {
    if (!newInstruction.trim()) return;
    setFormData(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), newInstruction.trim()],
    }));
    setNewInstruction('');
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...(formData.instructions || [])];
    updated[index] = value;
    setFormData(prev => ({ ...prev, instructions: updated }));
  };

  const removeInstruction = (index: number) => {
    const updated = [...(formData.instructions || [])];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, instructions: updated }));
  };

  const updateNutrition = (field: keyof NutritionInfo, value: number) => {
    setFormData(prev => ({
      ...prev,
      nutrition: { ...(prev.nutrition || emptyForm.nutrition!), [field]: value },
    }));
  };

  const toggleDietary = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietary: { ...(prev.dietary || {}), [restriction]: !prev.dietary?.[restriction] },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const url = isEditing ? `/api/recipes/${initialData?.id}` : '/api/recipes';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save recipe');
      }
      router.push('/recipes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8">
      <div className="space-y-8">

        {/* Title */}
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

        {/* Description */}
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

        {/* Yield */}
        <div>
          <label className="block text-sm font-medium mb-2">Yield</label>
          <input
            type="text"
            value={formData.yield}
            onChange={(e) => setFormData(prev => ({ ...prev, yield: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="e.g. 4 servings"
            required
          />
        </div>

        {/* Times */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Prep Time (mins)</label>
            <input
              type="number"
              value={formData.prepTime}
              onChange={(e) => handleTimeChange('prepTime', parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
              min={0}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Cook Time (mins)</label>
            <input
              type="number"
              value={formData.cookTime}
              onChange={(e) => handleTimeChange('cookTime', parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
              min={0}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Total Time (mins)
              <span className="text-xs text-gray-400 font-normal ml-1">auto-calculated</span>
            </label>
            <input
              type="number"
              value={formData.totalTime}
              onChange={(e) => handleTimeChange('totalTime', parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
              min={0}
              required
            />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium mb-3">Ingredients</label>
          <div className="flex gap-2 mb-3 items-center">
            <input
              type="number"
              value={newIngredient.quantity}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
              className="w-20 p-2 border rounded"
              placeholder="Qty"
              min={0}
              step="any"
            />
            <input
              type="text"
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
              className="w-24 p-2 border rounded"
              placeholder="Unit"
            />
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
              className="flex-1 p-2 border rounded"
              placeholder="Ingredient name"
            />
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
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
                  onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-20 p-2 border rounded"
                  min={0}
                  step="any"
                />
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-24 p-2 border rounded"
                />
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-700 cursor-pointer text-sm shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium mb-3">Instructions</label>
          <div className="flex gap-2 mb-3 items-start">
            <textarea
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  addInstruction();
                }
              }}
              className="flex-1 p-2 border rounded resize-none"
              rows={2}
              placeholder="Describe this step… (Ctrl+Enter to add)"
            />
            <button
              type="button"
              onClick={addInstruction}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
            >
              Add
            </button>
          </div>
          <ol className="space-y-2">
            {formData.instructions?.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-medium text-sm pt-2 w-5 shrink-0">{index + 1}.</span>
                <textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  className="flex-1 p-2 border rounded resize-none"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="text-red-500 hover:text-red-700 cursor-pointer text-sm pt-2 shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* Nutrition */}
        <div>
          <label className="block text-sm font-medium mb-3">Nutrition (per serving)</label>
          <div className="grid grid-cols-3 gap-4">
            {NUTRITION_FIELDS.map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  type="number"
                  value={formData.nutrition?.[field] ?? 0}
                  onChange={(e) => updateNutrition(field, parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded"
                  min={0}
                  step="any"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dietary restrictions */}
        <div>
          <label className="block text-sm font-medium mb-3">Dietary Restrictions</label>
          <div className="flex flex-wrap gap-4">
            {DIETARY_OPTIONS.map((restriction) => (
              <label key={restriction} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.dietary?.[restriction]}
                  onChange={() => toggleDietary(restriction)}
                />
                <span className="text-sm capitalize">{restriction}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/recipes')}
            className="px-4 py-2 border rounded hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
          >
            {isEditing ? 'Update Recipe' : 'Create Recipe'}
          </button>
        </div>

      </div>
    </form>
  );
}
