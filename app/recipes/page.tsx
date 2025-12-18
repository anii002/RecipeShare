'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecipeCard from '@/components/RecipeCard';
import { Search, Filter } from 'lucide-react';

interface Recipe {
  id: number;
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  category: string;
  image_url: string;
  author_name: string;
  created_at: string;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, [category]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      let url = '/api/recipes';
      if (category) {
        url += `?category=${category}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(search.toLowerCase()) ||
    recipe.description.toLowerCase().includes(search.toLowerCase()) ||
    recipe.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['All', 'Italian', 'Mexican', 'Asian', 'Dessert', 'Vegetarian'];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Discover Recipes</h1>
            <p className="text-xl opacity-90">Find your next favorite meal</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">Loading recipes...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
              <p className="text-gray-500">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}