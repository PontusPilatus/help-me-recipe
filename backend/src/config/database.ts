import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoURI = process.env.MONGODB_URI;
    console.log('MongoDB URI:', mongoURI);

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected Successfully');

    // List all collections
    const collections = await mongoose.connection.db.collections();
    console.log('Available collections:', collections.map(c => c.collectionName));

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 