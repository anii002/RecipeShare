'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    Clock,
    Users,
    ChefHat,
    Edit2,
    Trash2,
    ArrowLeft,
    Share2,
    Bookmark,
    Printer,
    Flag,
    AlertCircle,
    Star,
    Thermometer,
    Zap,
    Heart
} from 'lucide-react';

interface Recipe {
    id: number;
    title: string;
    description: string;
    ingredients: string;
    instructions: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty: string;
    category: string;
    image_url: string | null;
    author_name: string;
    created_at: string;
    user_id: number;
}

export default function RecipeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState<any>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchRecipe();
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [params.id]);

    const fetchRecipe = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/recipes/${params.id}`);
            const data = await response.json();

            if (data.success && data.recipe) {
                setRecipe(data.recipe);
            } else {
                setError(data.error || 'Failed to load recipe');
            }
        } catch (error) {
            console.error('Error fetching recipe:', error);
            setError('Failed to load recipe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/recipes/${params.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('Recipe deleted successfully!');
                router.push('/recipes');
            } else {
                alert(data.error || 'Failed to delete recipe');
            }
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('An error occurred while deleting the recipe.');
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Recipe link copied to clipboard!');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReport = () => {
        alert('Report feature coming soon!');
    };

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return <Zap className="w-4 h-4" />;
            case 'medium': return <Thermometer className="w-4 h-4" />;
            case 'hard': return <AlertCircle className="w-4 h-4" />;
            default: return <ChefHat className="w-4 h-4" />;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Italian': 'bg-red-50 text-red-700 border-red-100',
            'Mexican': 'bg-green-50 text-green-700 border-green-100',
            'Asian': 'bg-blue-50 text-blue-700 border-blue-100',
            'Dessert': 'bg-purple-50 text-purple-700 border-purple-100',
            'Indian': 'bg-orange-50 text-orange-700 border-orange-100',
        };
        return colors[category] || 'bg-gray-50 text-gray-700 border-gray-100';
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                    <div className="container mx-auto px-4 py-12">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                            <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
                            <div className="space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !recipe) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
                    <div className="container mx-auto px-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-600 hover:text-orange-500 mb-8 group"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Recipes
                        </button>

                        <div className="max-w-2xl mx-auto text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">Recipe Not Found</h1>
                            <p className="text-gray-600 mb-8">
                                {error || 'The recipe you are looking for does not exist or has been removed.'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => router.back()}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all hover:border-gray-400"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => router.push('/recipes')}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
                                >
                                    Browse Recipes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const totalTime = recipe.prep_time + recipe.cook_time;
    const isOwner = user && user.id === recipe.user_id;

    return (
        <>
            <Navbar />

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-4">Delete Recipe</h3>
                        <p className="text-gray-600 text-center mb-8">
                            Are you sure you want to delete &quot;{recipe.title}&quot;? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg"
                            >
                                Delete Recipe
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-red-500">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="container mx-auto px-4 py-12 relative">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-white/90 hover:text-white mb-8 group"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Recipes
                        </button>

                        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(recipe.difficulty)} border`}>
                                        <span className="flex items-center gap-2">
                                            {getDifficultyIcon(recipe.difficulty)}
                                            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                                        </span>
                                    </span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getCategoryColor(recipe.category)} border`}>
                                        {recipe.category}
                                    </span>
                                </div>

                                <h1 className="text-5xl font-bold text-white mb-6">{recipe.title}</h1>

                                <p className="text-white/90 text-lg mb-8 max-w-3xl">{recipe.description}</p>

                                <div className="flex flex-wrap items-center gap-6 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        <span className="font-semibold">{totalTime} min total</span>
                                        <span className="text-white/70">({recipe.prep_time} prep, {recipe.cook_time} cook)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        <span className="font-semibold">{recipe.servings} servings</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChefHat className="w-5 h-5" />
                                        <span className="font-semibold">{recipe.author_name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setIsFavorite(!isFavorite)}
                                    className={`p-3 rounded-xl border transition-all ${isFavorite
                                        ? 'bg-red-500 text-white border-red-500'
                                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                        }`}
                                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    {isFavorite ? (
                                        <Heart className="w-5 h-5 fill-current" />
                                    ) : (
                                        <Heart className="w-5 h-5" />
                                    )}
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="p-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20"
                                    title="Share recipe"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={handlePrint}
                                    className="p-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20"
                                    title="Print recipe"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={handleReport}
                                    className="p-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20"
                                    title="Report recipe"
                                >
                                    <Flag className="w-5 h-5" />
                                </button>

                                {isOwner && (
                                    <>
                                        <button
                                            onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                                            className="p-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20"
                                            title="Edit recipe"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="p-3 rounded-xl bg-red-500/20 text-white border border-red-500/30 hover:bg-red-500/30"
                                            title="Delete recipe"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Wave Divider */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
                            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                                opacity=".25" className="fill-white"></path>
                            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35,6.36,119.13-6.85,32.53-11.14,60.84-30.15,89-48,23.43-15.08,48.65-30,75.46-39C1055.24,13,1135.68,6.2,1200,12.47V0Z"
                                opacity=".5" className="fill-white"></path>
                            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                                className="fill-white"></path>
                        </svg>
                    </div>
                </div>

                {/* Recipe Content */}
                <div className="container mx-auto px-4 py-12 -mt-12 relative z-10">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Recipe Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Ingredients Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-bold text-gray-800">Ingredients</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Users className="w-4 h-4" />
                                        <span>For {recipe.servings} servings</span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {recipe.ingredients.split('\n').map((ingredient, index) => (
                                        <div key={index} className="flex items-start gap-3 group">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                                            <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                                {ingredient.trim()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Instructions Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-bold text-gray-800">Instructions</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock className="w-4 h-4" />
                                        <span>{totalTime} minutes</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {recipe.instructions.split('\n').map((step, index) => (
                                        <div key={index} className="flex gap-6 group">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                                    {step.trim()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-100">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Chef's Notes</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Star className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-1">Pro Tip</h4>
                                            <p className="text-gray-600">
                                                For best results, use fresh ingredients and follow the instructions carefully.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-1">Storage</h4>
                                            <p className="text-gray-600">
                                                Store leftovers in an airtight container in the refrigerator for up to 3 days.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-8">
                            {/* Nutrition Info */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Nutrition Info</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-600">Calories</span>
                                        <span className="font-semibold text-gray-800">~450 kcal</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-600">Protein</span>
                                        <span className="font-semibold text-gray-800">25g</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-600">Carbs</span>
                                        <span className="font-semibold text-gray-800">55g</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Fat</span>
                                        <span className="font-semibold text-gray-800">18g</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cooking Times */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border border-orange-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Cooking Times</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Preparation</p>
                                                <p className="font-bold text-gray-800">{recipe.prep_time} min</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                                <Thermometer className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Cooking</p>
                                                <p className="font-bold text-gray-800">{recipe.cook_time} min</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white/90">Total Time</p>
                                                <p className="font-bold">{totalTime} min</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Author Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                            <ChefHat className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{recipe.author_name}</h4>
                                        <p className="text-sm text-gray-500">Recipe Creator</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Joined</span>
                                        <span className="font-medium text-gray-800">
                                            {new Date(recipe.created_at).toLocaleDateString('en-US', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Recipes</span>
                                        <span className="font-medium text-gray-800">12+</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Rating</span>
                                        <span className="font-medium text-gray-800 flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            4.8
                                        </span>
                                    </div>
                                </div>

                                <button className="w-full mt-6 px-4 py-3 border-2 border-orange-500 text-orange-500 rounded-xl hover:bg-orange-50 transition-all font-medium">
                                    View Profile
                                </button>
                            </div>

                            {/* Tags */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Pasta', 'Italian', 'Dinner', 'Family Meal', 'Comfort Food', 'Easy Cooking'].map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
                        <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={`p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 ${isFavorite
                                ? 'bg-red-500 text-white'
                                : 'bg-white text-gray-800'
                                }`}
                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            {isFavorite ? (
                                <Heart className="w-6 h-6 fill-current" />
                            ) : (
                                <Heart className="w-6 h-6" />
                            )}
                        </button>

                        <button
                            onClick={handleShare}
                            className="p-4 rounded-full bg-white text-gray-800 shadow-2xl hover:scale-110 transition-all"
                            title="Share recipe"
                        >
                            <Share2 className="w-6 h-6" />
                        </button>

                        {isOwner && (
                            <button
                                onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                                className="p-4 rounded-full bg-orange-500 text-white shadow-2xl hover:scale-110 transition-all"
                                title="Edit recipe"
                            >
                                <Edit2 className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}