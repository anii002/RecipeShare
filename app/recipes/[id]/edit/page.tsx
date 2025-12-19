'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Clock, 
  Users, 
  ChefHat,
  AlertCircle
} from 'lucide-react';

interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  image_url: string;
  is_public: boolean;
}

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id as string;

  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: 'medium',
    category: '',
    image_url: '',
    is_public: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch recipe data on component mount
  useEffect(() => {
    if (!recipeId) return;

    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/recipes/${recipeId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Recipe not found');
          }
          if (response.status === 403) {
            throw new Error('You are not authorized to edit this recipe');
          }
          throw new Error('Failed to load recipe');
        }

        const data = await response.json();
        
        if (data.recipe) {
          setFormData({
            title: data.recipe.title || '',
            description: data.recipe.description || '',
            ingredients: data.recipe.ingredients || '',
            instructions: data.recipe.instructions || '',
            prep_time: data.recipe.prep_time || 0,
            cook_time: data.recipe.cook_time || 0,
            servings: data.recipe.servings || 1,
            difficulty: data.recipe.difficulty || 'medium',
            category: data.recipe.category || '',
            image_url: data.recipe.image_url || '',
            is_public: data.recipe.is_public !== false
          });
        }
      } catch (err: any) {
        console.error('Error fetching recipe:', err);
        setError(err.message || 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseInt(value) || 0 
        : type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value
    }));
  };

  // Handle form submission (Update)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || !formData.ingredients.trim() || !formData.instructions.trim()) {
      setError('Title, ingredients, and instructions are required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update recipe');
      }

      setSuccess('Recipe updated successfully!');
      
      // Redirect to recipe page after 1.5 seconds
      setTimeout(() => {
        router.push(`/recipes/${recipeId}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error updating recipe:', err);
      setError(err.message || 'Failed to update recipe');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete recipe
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete recipe');
      }

      // Redirect to recipes list after successful deletion
      router.push('/recipes');
      router.refresh();

    } catch (err: any) {
      console.error('Error deleting recipe:', err);
      setError(err.message || 'Failed to delete recipe');
      setDeleting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-12 h-12 text-orange-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/recipes/${recipeId}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Recipe
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
          <p className="text-gray-600 mt-2">Update your recipe details below</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                  placeholder="e.g., Classic Spaghetti Carbonara"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your recipe..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Italian, Dessert"
                  />
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Timing & Servings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Timing & Servings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="prep_time" className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline-block w-4 h-4 mr-1" />
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  id="prep_time"
                  name="prep_time"
                  value={formData.prep_time}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="cook_time" className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline-block w-4 h-4 mr-1" />
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  id="cook_time"
                  name="cook_time"
                  value={formData.cook_time}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="inline-block w-4 h-4 mr-1" />
                  Servings
                </label>
                <input
                  type="number"
                  id="servings"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Ingredients & Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ingredients *
              </h2>
              <textarea
                id="ingredients"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                placeholder="List ingredients one per line or with bullet points..."
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Use bullet points (•) or line breaks to separate ingredients
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Instructions *
              </h2>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Step-by-step instructions..."
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Number your steps for clarity
              </p>
            </div>
          </div>

          {/* Image & Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Image & Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://example.com/recipe-image.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Add a URL to an image of your finished dish
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
                  Make this recipe public (visible to everyone)
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="px-6 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              {deleting ? 'Deleting...' : 'Delete Recipe'}
            </button>

            <div className="flex items-center space-x-4">
              <Link
                href={`/recipes/${recipeId}`}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={saving || deleting}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : 'Update Recipe'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}