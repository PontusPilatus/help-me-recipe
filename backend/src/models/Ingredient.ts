import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);
export default Ingredient; 