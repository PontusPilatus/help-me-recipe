'use client';

import { useState, useEffect } from 'react';
import RecipeModal from './RecipeModal';

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
}

interface RecipeDetails extends Recipe {
  summary: string;
  instructions: string;
  sourceUrl: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PopularRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(null);

  useEffect(() => {
    fetchPopularRecipes();
  }, []);

  const fetchPopularRecipes = async () => {
    try {
      const response = await fetch(`${API_URL}/recipes/popular`);
      if (!response.ok) throw new Error('Failed to fetch popular recipes');
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading popular recipes...</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Popular Recipes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02]"
            onClick={() => handleRecipeClick(recipe.id)}
          >
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{recipe.title}</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>🕒 {recipe.readyInMinutes} mins</span>
                <span>👥 {recipe.servings} servings</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
} 