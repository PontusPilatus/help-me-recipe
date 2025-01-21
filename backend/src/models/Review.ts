import mongoose from 'mongoose';

export interface IReview extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  recipeId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipeId: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

// Create a compound index for one review per user per recipe
reviewSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema); 