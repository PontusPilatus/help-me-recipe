import express from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    console.log('Existing user check:', { exists: !!existingUser });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ email, password, name });
    await user.save();
    console.log('User created successfully:', { userId: user._id });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');

    // Send response without sensitive information
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      favoriteRecipes: user.favoriteRecipes,
      savedIngredients: user.savedIngredients
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    res.status(400).json({ error: errorMessage });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', { email: req.body.email });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log('User lookup result:', user ? 'User found' : 'User not found');

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    console.log('Password validation:', isValidPassword ? 'Success' : 'Failed');

    if (!isValidPassword) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Login successful for user:', user.email);

    // Send response without sensitive information
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      favoriteRecipes: user.favoriteRecipes,
      savedIngredients: user.savedIngredients
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Failed to login' });
  }
});

// Get user profile
router.get('/profile', auth, async (req: any, res) => {
  res.json(req.user);
});

// Add recipe to favorites
router.post('/favorites', auth, async (req: any, res) => {
  try {
    const { recipeId, title, image } = req.body;
    const user = req.user;

    // Check if recipe is already in favorites
    if (user.favoriteRecipes.some((recipe: any) => recipe.recipeId === recipeId)) {
      return res.status(400).json({ error: 'Recipe already in favorites' });
    }

    user.favoriteRecipes.push({
      recipeId,
      title,
      image,
      savedAt: new Date(),
    });

    await user.save();
    res.json(user.favoriteRecipes);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add favorite' });
  }
});

// Remove recipe from favorites
router.delete('/favorites/:recipeId', auth, async (req: any, res) => {
  try {
    const user = req.user;
    user.favoriteRecipes = user.favoriteRecipes.filter(
      (recipe: any) => recipe.recipeId !== parseInt(req.params.recipeId)
    );
    await user.save();
    res.json(user.favoriteRecipes);
  } catch (error) {
    res.status(400).json({ error: 'Failed to remove favorite' });
  }
});

// Save ingredient to user's list
router.post('/ingredients', auth, async (req: any, res) => {
  try {
    const { name } = req.body;
    const user = req.user;

    // Check if ingredient is already in the list
    if (user.savedIngredients.some((ingredient: any) => ingredient.name === name)) {
      return res.status(400).json({ error: 'Ingredient already in list' });
    }

    user.savedIngredients.push({
      name,
      addedAt: new Date(),
    });

    await user.save();
    res.json(user.savedIngredients);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add ingredient' });
  }
});

// Remove ingredient from user's list
router.delete('/ingredients/:name', auth, async (req: any, res) => {
  try {
    const user = req.user;
    user.savedIngredients = user.savedIngredients.filter(
      (ingredient: any) => ingredient.name !== req.params.name
    );
    await user.save();
    res.json(user.savedIngredients);
  } catch (error) {
    res.status(400).json({ error: 'Failed to remove ingredient' });
  }
});

export default router; 