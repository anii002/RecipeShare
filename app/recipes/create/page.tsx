'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateRecipePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        prep_time: 30,
        cook_time: 30,
        servings: 4,
        difficulty: 'medium',
        category: 'Uncategorized'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            router.push('/login');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Recipe created successfully!');
                router.push('/recipes');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to create recipe');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-600 hover:text-orange-500 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">Create New Recipe</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Recipe Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="e.g., Classic Chocolate Chip Cookies"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Tell us about your recipe..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prep Time (min) *
                                        </label>
                                        <input
                                            type="number"
                                            name="prep_time"
                                            value={formData.prep_time}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cook Time (min) *
                                        </label>
                                        <input
                                            type="number"
                                            name="cook_time"
                                            value={formData.cook_time}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Servings *
                                        </label>
                                        <input
                                            type="number"
                                            name="servings"
                                            value={formData.servings}
                                            onChange={handleChange}
                                            min="1"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option>Uncategorized</option>
                                            <option>Italian</option>
                                            <option>Mexican</option>
                                            <option>Asian</option>
                                            <option>Dessert</option>
                                            <option>Vegetarian</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Difficulty
                                        </label>
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-6">Ingredients *</h2>
                            <textarea
                                name="ingredients"
                                value={formData.ingredients}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                                placeholder="Enter ingredients, one per line:
• 2 cups all-purpose flour
• 1 cup sugar
• 3 large eggs"
                            />
                        </div>

                        {/* Instructions */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-6">Instructions *</h2>
                            <textarea
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                required
                                rows={8}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Provide step-by-step instructions:
1. Preheat oven to 350°F
2. Mix dry ingredients
3. Add wet ingredients
4. Bake for 20-25 minutes"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Create Recipe
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}