import express from 'express';
import { auth } from '../middleware/auth';
import Review, { IReview } from '../models/Review';

const router = express.Router();

// Create a review
router.post('/', auth, async (req: any, res) => {
  try {
    const review = new Review({
      ...req.body,
      userId: req.user._id
    });
    await review.save();
    res.status(201).json(review);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
    res.status(400).json({ error: errorMessage });
  }
});

// Get all reviews for a recipe
router.get('/recipe/:recipeId', async (req, res) => {
  try {
    const reviews = await Review.find({ recipeId: req.params.recipeId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
    res.status(400).json({ error: errorMessage });
  }
});

// Get user's reviews
router.get('/user', auth, async (req: any, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user reviews';
    res.status(400).json({ error: errorMessage });
  }
});

// Update a review
router.patch('/:id', auth, async (req: any, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const allowedUpdates = ['rating', 'comment'];
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    // Type-safe update
    updates.forEach(update => {
      if (update === 'rating') review.rating = req.body.rating;
      if (update === 'comment') review.comment = req.body.comment;
    });

    await review.save();
    res.json(review);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update review';
    res.status(400).json({ error: errorMessage });
  }
});

// Delete a review
router.delete('/:id', auth, async (req: any, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
    res.status(400).json({ error: errorMessage });
  }
});

export default router; 