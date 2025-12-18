'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChefHat, Search, User, LogOut, Menu, X, Home, PlusCircle } from 'lucide-react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <ChefHat className="w-8 h-8 text-orange-500" />
                        <span className="text-xl font-bold text-gray-800">RecipeShare</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-gray-600 hover:text-orange-500 transition-colors">
                            Home
                        </Link>
                        <Link href="/recipes" className="text-gray-600 hover:text-orange-500 transition-colors">
                            Recipes
                        </Link>
                        {user && (
                            <Link href="/recipes/create" className="text-gray-600 hover:text-orange-500 transition-colors">
                                Create Recipe
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700">Hello, {user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-orange-500 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-orange-500 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col space-y-4">
                            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-orange-500">
                                Home
                            </Link>
                            <Link href="/recipes" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-orange-500">
                                Recipes
                            </Link>
                            {user && (
                                <Link href="/recipes/create" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-orange-500">
                                    Create Recipe
                                </Link>
                            )}

                            {user ? (
                                <>
                                    <div className="text-gray-700 py-2">Hello, {user.name}</div>
                                    <button onClick={handleLogout} className="text-gray-600 hover:text-orange-500 text-left">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-orange-500">
                                        Login
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-center">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}