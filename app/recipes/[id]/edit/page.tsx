'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    ArrowLeft,
    Save,
    Upload,
    Clock,
    Users,
    ChefHat,
    X,
    AlertCircle
} from 'lucide-react';

const categories = [
    'Italian', 'Mexican', 'Asian', 'American',
    'Vegetarian', 'Vegan', 'Dessert', 'Breakfast',
    'Lunch', 'Dinner', 'Appetizer', 'Drinks'
];

const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
];

export default function EditRecipePage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        prep_time: 30,
        cook_time: 30,
        servings: 4,
        difficulty: 'medium',
        category: 'Uncategorized',
        image_url: '',
        is_public: true
    });

    useEffect(() => {
        fetchRecipe();
    }, [params.id]);

    const fetchRecipe = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/recipes/${params.id}`);
            const data = await response.json();

            if (data.success && data.recipe) {
                setFormData({
                    title: data.recipe.title,
                    description: data.recipe.description || '',
                    ingredients: data.recipe.ingredients,
                    instructions: data.recipe.instructions,
                    prep_time: data.recipe.prep_time,
                    cook_time: data.recipe.cook_time,
                    servings: data.recipe.servings,
                    difficulty: data.recipe.difficulty,
                    category: data.recipe.category,
                    image_url: data.recipe.image_url || '',
                    is_public: data.recipe.is_public
                });
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value) || 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/recipes/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Recipe updated successfully!');
                router.push(`/recipes/${params.id}`);
            } else {
                setError(data.error || 'Failed to update recipe');
            }
        } catch (error) {
            console.error('Error updating recipe:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.push(`/recipes/${params.id}`)}
                            className="flex items-center text-gray-600 hover:text-orange-500 mb-4 group"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Recipe
                        </button>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-800">Edit Recipe</h1>
                                <p className="text-gray-600 mt-2">Update your culinary creation</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
                                <ChefHat className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start">
                            <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 mr-4 flex-shrink-0" />
                            <div>
                                <p className="text-red-700 font-medium mb-1">Error</p>
                                <p className="text-red-600">{error}</p>
                            </div>
                            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-100">
                                Basic Information
                            </h2>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-3">
                                        Recipe Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-lg"
                                        placeholder="e.g., Classic Chocolate Chip Cookies"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-3">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-lg"
                                        placeholder="Tell the story behind your recipe..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-lg font-medium text-gray-700 mb-3">
                                            <Clock className="inline w-5 h-5 mr-2 text-orange-500" />
                                            Prep Time (min) *
                                        </label>
                                        <input
                                            type="number"
                                            name="prep_time"
                                            value={formData.prep_time}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-gray-700 mb-3">
                                            <Clock className="inline w-5 h-5 mr-2 text-orange-500" />
                                            Cook Time (min) *
                                        </label>
                                        <input
                                            type="number"
                                            name="cook_time"
                                            value={formData.cook_time}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-gray-700 mb-3">
                                            <Users className="inline w-5 h-5 mr-2 text-orange-500" />
                                            Servings *
                                        </label>
                                        <input
                                            type="number"
                                            name="servings"
                                            value={formData.servings}
                                            onChange={handleChange}
                                            min="1"
                                            required
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-lg font-medium text-gray-700 mb-3">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-lg appearance-none bg-white"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-gray-700 mb-3">
                                            Difficulty
                                        </label>
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-lg appearance-none bg-white"
                                        >
                                            {difficulties.map((diff) => (
                                                <option key={diff.value} value={diff.value}>{diff.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-3">
                                        Image URL (Optional)
                                    </label>
                                    <div className="flex gap-4">
                                        <input
                                            type="url"
                                            name="image_url"
                                            value={formData.image_url}
                                            onChange={handleChange}
                                            className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-lg"
                                            placeholder="https://example.com/recipe-image.jpg"
                                        />
                                        <button
                                            type="button"
                                            className="px-6 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Upload className="w-5 h-5" />
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-100">
                                Ingredients *
                            </h2>
                            <textarea
                                name="ingredients"
                                value={formData.ingredients}
                                onChange={handleChange}
                                required
                                rows={8}
                                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-mono text-lg"
                                placeholder="Enter each ingredient on a new line:
• 2 cups all-purpose flour
• 1 cup sugar
• 3 large eggs
• 1 tsp vanilla extract
• ..."
                            />
                            <p className="text-gray-500 mt-4 text-lg">
                                Use bullet points (•) or numbers for each ingredient. Separate with line breaks.
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-100">
                                Instructions *
                            </h2>
                            <textarea
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                required
                                rows={10}
                                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-lg"
                                placeholder="Provide detailed step-by-step instructions:
1. Preheat oven to 350°F (175°C)
2. Mix dry ingredients in a large bowl
3. Beat eggs and sugar until fluffy
4. Gradually add dry ingredients to wet ingredients
5. Pour into prepared baking dish
6. Bake for 25-30 minutes
7. Let cool before serving..."
                            />
                            <p className="text-gray-500 mt-4 text-lg">
                                Number each step for clarity. Be as detailed as possible!
                            </p>
                        </div>

                        {/* Privacy Settings */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Privacy Settings</h2>
                            <div className="flex items-center p-6 bg-white/50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="is_public"
                                    name="is_public"
                                    checked={formData.is_public}
                                    onChange={handleChange}
                                    className="w-6 h-6 text-orange-500 rounded focus:ring-2 focus:ring-orange-300"
                                />
                                <label htmlFor="is_public" className="ml-4 text-lg text-gray-700">
                                    Make this recipe public (visible to everyone)
                                </label>
                            </div>
                            <p className="text-gray-600 mt-4 text-lg">
                                Uncheck to keep this recipe private (only you can see it)
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-6 pt-8 border-t border-gray-200">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-gray-700">Ready to update?</h3>
                                <p className="text-gray-500 text-sm">
                                    Make sure all required fields are filled correctly.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push(`/recipes/${params.id}`)}
                                    className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium text-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-lg flex items-center gap-3"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Update Recipe
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </>
    );
}