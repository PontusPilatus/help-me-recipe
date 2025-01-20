import express from 'express';
import Ingredient from '../models/Ingredient.js';

const router = express.Router();

// Get all ingredients
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ createdAt: -1 });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Add new ingredient
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const ingredient = await Ingredient.create({ name });
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add ingredient' });
  }
});

// Delete ingredient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Ingredient.findByIdAndDelete(id);
    res.json({ message: 'Ingredient deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

export default router; 