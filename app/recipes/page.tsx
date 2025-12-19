'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecipeCard from '@/components/RecipeCard';
import {
  Filter,
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Recipe {
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
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const categories = [
  'All Categories',
  'Italian',
  'Mexican',
  'Asian',
  'Vegetarian',
  'Vegan',
  'Dessert',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Appetizer',
  'Drinks'
];

const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All Categories',
    difficulty: 'All',
    search: searchParams.get('search') || ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchRecipes();
  }, [filters.category, filters.difficulty, pagination.page]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.category && filters.category !== 'All Categories') {
        params.append('category', filters.category);
      }
      if (filters.difficulty && filters.difficulty !== 'All') {
        params.append('difficulty', filters.difficulty.toLowerCase());
      }
      if (pagination.page > 1) {
        params.append('page', pagination.page.toString());
      }

      const url = `/api/recipes${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setRecipes(data.recipes || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRecipes();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.category.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Discover Amazing Recipes</h1>
            <p className="text-xl opacity-90">
              Explore {pagination.total}+ recipes shared by our community
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </form>

              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => {
                      setFilters({ ...filters, category: e.target.value });
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => {
                      setFilters({ ...filters, difficulty: e.target.value });
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

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
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{filteredRecipes.length}</span> of <span className="font-semibold">{pagination.total}</span> recipes
                </p>
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </div>
              </div>

              <div className={viewMode === 'grid'
                ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8'
                : 'space-y-6'
              }>
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg ${pagination.page === pageNum
                            ? 'bg-orange-500 text-white'
                            : 'border hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}