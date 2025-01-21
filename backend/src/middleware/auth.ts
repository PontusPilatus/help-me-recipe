import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface JwtPayload {
  _id: string;
}

interface AuthRequest extends Request {
  user?: IUser;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Received token:', token ? 'Token present' : 'No token');

    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    console.log('Auth middleware - Token decoded successfully');

    const user = await User.findById(decoded._id);
    console.log('Auth middleware - User lookup result:', user ? 'User found' : 'User not found');

    if (!user) {
      console.log('Auth middleware - User not found in database');
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    console.log('Auth middleware - Authentication successful for user:', user.email);
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
}; 