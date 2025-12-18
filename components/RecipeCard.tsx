'use client';

import Link from 'next/link';
import { Clock, Users, ChefHat, Edit2, Trash2 } from 'lucide-react';

interface RecipeCardProps {
  recipe: {
    id: number;
    title: string;
    description: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty: string;
    category: string;
    author_name: string;
  };
  showActions?: boolean;
  onDelete?: (id: number) => void;
}

export default function RecipeCard({ recipe, showActions = false, onDelete }: RecipeCardProps) {
  const totalTime = recipe.prep_time + recipe.cook_time;
  
  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }[recipe.difficulty];

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok && onDelete) {
        onDelete(recipe.id);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
      {/* Image Placeholder */}
      <div className="h-56 bg-gradient-to-br from-orange-500 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <ChefHat className="w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${difficultyColor} shadow-lg`}>
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Link href={`/recipes/${recipe.id}`} className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-1">
              {recipe.title}
            </h3>
          </Link>
          
          {showActions && (
            <div className="flex gap-2 ml-4">
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-6 line-clamp-2 group-hover:text-gray-700 transition-colors">
          {recipe.description || 'A delicious recipe waiting to be discovered.'}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              <span>{totalTime} min</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-orange-500" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {recipe.category}
          </span>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mr-3">
              <span className="text-xs font-bold text-white">
                {recipe.author_name.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-gray-700">{recipe.author_name}</span>
          </div>
          
          <Link
            href={`/recipes/${recipe.id}`}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
          >
            View Recipe
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}