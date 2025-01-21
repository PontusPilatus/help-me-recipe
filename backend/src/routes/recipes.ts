import express from 'express';
import axios, { AxiosError } from 'axios';

const router = express.Router();

// In-memory cache
const cache = {
  popular: {
    data: null as any,
    timestamp: 0,
    TTL: 1000 * 60 * 60, // 1 hour
  },
  recipes: new Map<string, { data: any; timestamp: number }>(),
};

const RECIPE_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number, ttl: number) => {
  return Date.now() - timestamp < ttl;
};

// Get API quota information
router.get('/quota', async (req, res) => {
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        number: 1
      }
    });

    const quotaUsed = response.headers['x-api-quota-used'];
    const quotaLeft = response.headers['x-api-quota-left'];
    const quotaRequests = {
      used: quotaUsed,
      remaining: quotaLeft,
    };

    res.json(quotaRequests);
  } catch (error) {
    console.error('Error checking API quota:', error);
    res.status(500).json({ error: 'Failed to check API quota' });
  }
});

// Get popular recipes with random offset
router.get('/popular', async (req, res) => {
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/random', {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        number: 6,
        addRecipeInformation: true,
        limitLicense: true,
      }
    });

    const recipes = response.data.recipes.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      sourceUrl: recipe.sourceUrl,
      summary: recipe.summary,
      instructions: recipe.analyzedInstructions?.[0]?.steps?.map((step: any) => ({
        number: step.number,
        step: step.step
      })) || recipe.instructions?.split('\n').filter(Boolean).map((step: string, index: number) => ({
        number: index + 1,
        step: step.trim()
      })) || []
    }));

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching popular recipes:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Spoonacular API error:', {
        status: error.response.status,
        data: error.response.data
      });
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to fetch popular recipes' });
    }
  }
});

// Get recipe details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check cache first
    const cachedRecipe = cache.recipes.get(id);
    if (cachedRecipe && isCacheValid(cachedRecipe.timestamp, RECIPE_CACHE_TTL)) {
      console.log(`Serving recipe ${id} from cache`);
      return res.json(cachedRecipe.data);
    }

    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
      }
    });

    // Update cache
    cache.recipes.set(id, {
      data: response.data,
      timestamp: Date.now()
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Spoonacular error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
});

// Search recipes by ingredients
router.post('/search', async (req, res) => {
  try {
    const { ingredients, diet, intolerances, cuisine, type, maxReadyTime } = req.body;

    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        includeIngredients: ingredients.join(','),
        addRecipeInformation: true,
        diet: diet,
        intolerances: intolerances,
        cuisine: cuisine,
        type: type,
        maxReadyTime: maxReadyTime,
        number: 6,
        instructionsRequired: true,
        fillIngredients: true,
        sort: 'max-used-ingredients' // Prioritize recipes that use more of the provided ingredients
      }
    });

    // Transform the response to match our expected format
    const recipes = response.data.results.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      sourceUrl: recipe.sourceUrl,
      summary: recipe.summary,
      instructions: recipe.analyzedInstructions?.[0]?.steps?.map((step: any) => ({
        number: step.number,
        step: step.step
      })) || recipe.instructions?.split('\n').filter(Boolean).map((step: string, index: number) => ({
        number: index + 1,
        step: step.trim()
      })) || []
    }));

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Spoonacular error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

export default router; 