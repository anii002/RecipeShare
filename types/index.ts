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
  description?: string;
  ingredients: string;
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  image_url?: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
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