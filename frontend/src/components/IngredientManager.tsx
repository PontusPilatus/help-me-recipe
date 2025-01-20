'use client';

import { useState } from 'react';
import RecipeModal from './RecipeModal';

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  instructions: string;
  sourceUrl: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const dietaryOptions = [
  { value: '', label: 'No Diet Restriction' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'ketogenic', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
];

const intoleranceOptions = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'egg', label: 'Egg' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'peanut', label: 'Peanut' },
  { value: 'soy', label: 'Soy' },
  { value: 'shellfish', label: 'Shellfish' },
];

const cuisineOptions = [
  { value: '', label: 'Any Cuisine' },
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'indian', label: 'Indian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'thai', label: 'Thai' },
  { value: 'mediterranean', label: 'Mediterranean' },
];

const mealTypeOptions = [
  { value: '', label: 'Any Meal' },
  { value: 'main course', label: 'Main Course' },
  { value: 'side dish', label: 'Side Dish' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'salad', label: 'Salad' },
  { value: 'bread', label: 'Bread' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'soup', label: 'Soup' },
  { value: 'snack', label: 'Snack' },
];

const timeRangeOptions = [
  { value: '', label: 'Any Time' },
  { value: '15', label: '15 minutes or less' },
  { value: '30', label: '30 minutes or less' },
  { value: '45', label: '45 minutes or less' },
  { value: '60', label: '1 hour or less' },
  { value: '120', label: '2 hours or less' },
];

export default function IngredientManager() {
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleAddIngredient = () => {
    if (ingredient.trim() && !ingredients.includes(ingredient.trim())) {
      setIngredients([...ingredients, ingredient.trim()]);
      setIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
  };

  const handleIntoleranceToggle = (intolerance: string) => {
    setSelectedIntolerances(prev =>
      prev.includes(intolerance)
        ? prev.filter(i => i !== intolerance)
        : [...prev, intolerance]
    );
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/recipes/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          diet: selectedDiet,
          intolerances: selectedIntolerances.join(','),
          cuisine: selectedCuisine,
          type: selectedMealType,
          maxReadyTime: selectedTime || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = async (recipeId: number) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${recipeId}`);
      if (!response.ok) throw new Error('Failed to fetch recipe details');
      const data = await response.json();
      setSelectedRecipe(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
            placeholder="Enter an ingredient"
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button
            onClick={handleAddIngredient}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Ingredient Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {ingredients.map((ing) => (
            <span
              key={ing}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {ing}
              <button
                onClick={() => handleRemoveIngredient(ing)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Restriction
            </label>
            <select
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {dietaryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cooking Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooking Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine
            </label>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {cuisineOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {mealTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Intolerances */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intolerances
          </label>
          <div className="flex flex-wrap gap-2">
            {intoleranceOptions.map(option => (
              <label key={option.value} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIntolerances.includes(option.value)}
                  onChange={() => handleIntoleranceToggle(option.value)}
                  className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={ingredients.length === 0 || loading}
        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:bg-gray-300"
      >
        {loading ? 'Searching...' : 'Find Recipes'}
      </button>

      {/* Recipe Results */}
      {recipes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Found Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold mb-2">{recipe.title}</h4>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>🕒 {recipe.readyInMinutes} mins</span>
                    <span>👥 {recipe.servings} servings</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
} 