import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { connectDB } from './config/mongodb.js';
import ingredientRoutes from './routes/ingredients.js';
import recipeRoutes from './routes/recipes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);

// Connect to MongoDB
connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 