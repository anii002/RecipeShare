import mongoose from 'mongoose';

// Database types
export interface IUserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  favorites?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecipeDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  image_url?: string;
  user_id: mongoose.Types.ObjectId;
  is_public: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Populated types
export interface IRecipePopulated extends Omit<IRecipeDocument, 'user_id'> {
  user_id: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

// Frontend/API Response types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  image_url: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}