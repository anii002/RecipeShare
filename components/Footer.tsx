import Link from 'next/link';
import { ChefHat, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ChefHat className="w-6 h-6 text-orange-400" />
              <span className="text-xl font-bold">RecipeShare</span>
            </div>
            <p className="text-gray-400">
              Share your culinary creations with the world. Join our community of food lovers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="text-gray-400 hover:text-white">
                  Recipes
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-white">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Developer</h3>
            <div className="space-y-2">
              <p className="text-gray-400">Aniket Gupta</p>
              <div className="flex space-x-4">
                <a href="https://github.com/anii002" className="text-gray-400 hover:text-white">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/aniket-gupta-5b108a250/" className="text-gray-400 hover:text-white">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} RecipeShare. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Built By Aniket
          </p>
        </div>
      </div>
    </footer>
  );
}