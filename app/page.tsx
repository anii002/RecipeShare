import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChefHat, Clock, Users, Shield, TrendingUp, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />
      
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <ChefHat className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Share Your <span className="text-orange-200">Culinary</span> Creations
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Join our community of food lovers. Discover, share, and create amazing recipes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/recipes"
                className="bg-white text-orange-500 px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Browse Recipes
              </Link>
              <Link
                href="/register"
                className="bg-transparent border-2 border-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why RecipeShare?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Easy to Use</h3>
              <p className="text-gray-600">
                Simple, intuitive interface for sharing and discovering recipes
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Grow Together</h3>
              <p className="text-gray-600">
                Connect with food enthusiasts from around the world
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Share Passion</h3>
              <p className="text-gray-600">
                Share your love for cooking with our friendly community
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to Share Your Recipes?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of home cooks sharing their best recipes
          </p>
          <Link
            href="/register"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}