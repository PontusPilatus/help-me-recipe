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

// Get popular recipes
router.get('/popular', async (req, res) => {
  try {
    // Check cache first
    if (cache.popular.data && isCacheValid(cache.popular.timestamp, cache.popular.TTL)) {
      console.log('Serving popular recipes from cache');
      return res.json(cache.popular.data);
    }

    const response = await axios.get('https://api.spoonacular.com/recipes/random', {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        number: 6,
        addRecipeInformation: true,
        limitLicense: true
      }
    });

    // Update cache
    cache.popular.data = response.data.recipes;
    cache.popular.timestamp = Date.now();

    console.log('Spoonacular response:', {
      status: response.status,
      recipes_count: response?.data?.recipes?.length,
      first_recipe: response?.data?.recipes?.[0]?.title
    });

    res.json(response.data.recipes);
  } catch (error) {
    console.error('Error fetching popular recipes:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Spoonacular error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    // If error occurs and we have cached data, return it even if expired
    if (cache.popular.data) {
      console.log('Serving expired popular recipes from cache due to API error');
      return res.json(cache.popular.data);
    }
    res.status(500).json({ error: 'Failed to fetch popular recipes' });
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

    // Cache the recipe details we get from the search
    const recipes = response.data.results;
    recipes.forEach((recipe: any) => {
      if (!cache.recipes.has(recipe.id.toString())) {
        cache.recipes.set(recipe.id.toString(), {
          data: recipe,
          timestamp: Date.now()
        });
      }
    });

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