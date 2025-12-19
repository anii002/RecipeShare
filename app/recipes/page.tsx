import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecipesContent from './RecipesContent';

export default function RecipesPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold mb-4">Discover Amazing Recipes</h1>
              <p className="text-xl opacity-90">Loading recipes...</p>
            </div>
          </div>
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading recipes...</p>
          </div>
        </div>
      }>
        <RecipesContent />
      </Suspense>
      <Footer />
    </>
  );
}