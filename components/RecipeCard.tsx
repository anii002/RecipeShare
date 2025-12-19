'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Clock, 
  Users, 
  ChefHat, 
  Star, 
  Edit2, 
  Trash2,
  Share2,
  Bookmark
} from 'lucide-react';

interface RecipeCardProps {
  recipe: {
    id: string; 
    title: string;
    description: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty: string;
    category: string;
    image_url: string;
    author_name: string;
    author_avatar: string;
    created_at: string;
  };
  showActions?: boolean;
  onDelete?: (id: string) => void; 
}

export default function RecipeCard({ recipe, showActions = false, onDelete }: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalTime = recipe.prep_time + recipe.cook_time;

  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }[recipe.difficulty] || 'bg-gray-100 text-gray-800';

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 bg-gray-200">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
            <ChefHat className="w-16 h-16 text-orange-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}>
            {recipe.difficulty?.charAt(0).toUpperCase() + recipe.difficulty?.slice(1)}
          </span>
        </div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 left-3 p-2 bg-white rounded-full shadow hover:bg-gray-50"
        >
          <Bookmark className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/recipes/${recipe.id}`}>
            <h3 className="text-xl font-bold text-gray-800 hover:text-orange-500 transition-colors line-clamp-1">
              {recipe.title}
            </h3>
          </Link>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {recipe.description || 'No description available.'}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{totalTime} min</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {recipe.category}
          </span>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden mr-3">
              {recipe.author_avatar ? (
                <Image
                  src={recipe.author_avatar}
                  alt={recipe.author_name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-500">
                    {recipe.author_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {recipe.author_name}
            </span>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                title="Share"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/recipes/${recipe.id}`);
                  alert('Link copied to clipboard!');
                }}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}