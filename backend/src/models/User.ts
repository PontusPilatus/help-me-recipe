import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  favoriteRecipes: Array<{
    recipeId: number;
    title: string;
    image: string;
    savedAt: Date;
  }>;
  savedIngredients: Array<{
    name: string;
    addedAt: Date;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  favoriteRecipes: [{
    recipeId: Number,
    title: String,
    image: String,
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  savedIngredients: [{
    name: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error as CallbackError);
    } else {
      next(new Error('An unknown error occurred while hashing the password'));
    }
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Handle duplicate key errors
userSchema.post('save', function (error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

const User = mongoose.model<IUser>('User', userSchema);

// Create indexes
User.createIndexes().then(() => {
  console.log('User indexes created successfully');
}).catch(err => {
  console.error('Error creating user indexes:', err);
});

export default User; 